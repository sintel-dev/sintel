import logging

from bson import ObjectId
from flask_restful import Resource, reqparse
from werkzeug.security import check_password_hash, generate_password_hash

from mtv.db import schema
from mtv.resources import auth_utils

LOGGER = logging.getLogger(__name__)


def get_user(user_doc):
    return {
        'id': str(user_doc.id),
        'name': user_doc.name,
        'email': user_doc.email,
        'picture': user_doc.picture
    }


def validate_user_id(user_id):
    try:
        uid = ObjectId(user_id)
    except Exception as e:
        LOGGER.exception(e)
        return {'message': str(e)}, 400

    user_doc = schema.User.find_one(id=uid)

    if user_doc is None:
        LOGGER.exception('User %s does not exist.', user_id)
        return {
            'message': 'User {} does not exist'.format(user_id)
        }, 400

    return user_doc, 200


class User(Resource):

    @auth_utils.requires_auth
    def get(self, user_id):
        """
        Get a user by ID
        ---
        tags:
          - user
        security:
          - tokenAuth: []
        parameters:
          - name: user_id
            in: path
            schema:
              type: string
            required: true
            description: user ID - MongoDB ObjectId
            example: '5f5b0bb5013e4f912fba337d'
        responses:
          200:
            description: Signal to be returned
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    user:
                      $ref: '#/components/schemas/Signal'
          401:
            $ref: '#/components/responses/UnauthorizedError'
        """

        user_doc, status = validate_user_id(user_id)
        if (status == 400):
            return {'message': 'Wrong user_id is given'}, 400

        user = get_user(user_doc)
        return {
            'user': user
        }, 200


class Users(Resource):

    @auth_utils.requires_auth
    def get(self):
        """
        Return all users
        ---
        tags:
          - user
        security:
          - tokenAuth: []
        responses:
          200:
            description: All users
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    users:
                      type: array
                      items:
                        $ref: '#/components/schemas/User'
          401:
            $ref: '#/components/responses/UnauthorizedError'
        """

        users = list()
        user_docs = schema.User.find()
        for user_doc in user_docs:
            user = get_user(user_doc)
            users.append(user)

        return {
            'users': users
        }, 200


class Signup(Resource):

    def __init__(self):
        parser_post = reqparse.RequestParser(bundle_errors=True)
        parser_post.add_argument('email', type=str, required=True,
                                 location='json')
        parser_post.add_argument('name', type=str, required=True,
                                 location='json')
        self.parser_post = parser_post

    def post(self):
        """
        Register a new user account
        ---
        tags:
          - user
        security:
          - tokenAuth: []
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  email:
                    type: string
                  name:
                    type: string
                required: ['email', 'name']
        responses:
          200:
            description: Success Message
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
                example:
                  code: 200
                  message: 'password has been sent to your email'
          400:
            description: Failure Message - invalid arguments
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
          500:
            description: Failure Message - register user error
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
        """

        try:
            args = self.parser_post.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            # create user profile
            password = auth_utils.generate_password(size=4)
            password_encrypted = generate_password_hash(password)
            user = dict()
            user['email'] = args['email']
            user['name'] = args['name']
            user['password'] = password_encrypted
            # always use the same placehold for avatar
            user['picture'] = ('https://user-images.githubusercontent.com/'
                               '8490637/93004647-d895c100-f516-11ea-8c74-3'
                               '32d98bbf2ad.png')

            # check whether this email has been registered before
            if schema.User.find_one(email=user['email']):
                raise Exception('Email already exist')

            origin_name = user['name']
            # if the name is used, random append 3 digits
            # e.g., jack -> jack798
            while schema.User.find_one(name=user['name']):
                user['name'] = origin_name + auth_utils.generate_digits(size=3)

            # send password to the user email
            auth_utils.send_mail('MTV: your password', password, user['email'])

            # insert user to DB
            schema.User.insert(**user)

            return {
                'message': 'password has been sent to your email',
                'code': 200
            }, 200

        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500


class Signin(Resource):

    def __init__(self):
        parser_post = reqparse.RequestParser(bundle_errors=True)
        parser_post.add_argument('email', type=str, required=True,
                                 location='json')
        parser_post.add_argument('password', type=str, required=True,
                                 location='json')
        parser_post.add_argument('rememberMe', type=str, default=False,
                                 location='json')
        self.parser_post = parser_post

    def post(self):
        """
        User sign in
        ---
        tags:
          - user
        security:
          - tokenAuth: []
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  email:
                    type: string
                  password:
                    type: string
                required: ['email', 'password']
        responses:
          200:
            description: User Object
            content:
              application/json:
                schema:
                  uid:
                    type: string
                  name:
                    type: string
                  email:
                    type: string
                  picture:
                    type: string
                    description: base64 format
                  token:
                    type: string
                    description: server token used to authenticate APIs
          401:
            description: Auth Error Message
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
          500:
            description: Failure Message
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
        """

        try:
            args = self.parser_post.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            email = args['email']
            password = args['password']
            # TODO: rememberME - token should not expire

            user = schema.User.find_one(email=email)
            if user and check_password_hash(user.password, password):
                token = auth_utils.generate_auth_token(str(user.id)).decode()
                return {
                    'data': {
                        'uid': str(user.id),
                        'name': user.name,
                        'email': user.email,
                        'picture': user.picture,
                        'token': token
                    }
                }, 200
            else:
                return {
                    'message': 'Email and/or Passkey are wrong!',
                    'code': 401
                }, 401
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500


class Signout(Resource):

    @auth_utils.requires_auth
    def get(self):
        # TODO: use flask.session to maintain user pool
        # require client pass UID to server
        return {}, 204


class Reset(Resource):

    def __init__(self):
        parser_put = reqparse.RequestParser(bundle_errors=True)
        parser_put.add_argument('email', type=str, required=True,
                                location='json')
        self.parser_put = parser_put

    def put(self):
        """
        Reset password
        ---
        tags:
          - user
        security:
          - tokenAuth: []
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  email:
                    type: string
                required: ['email']
        responses:
          200:
            description: Success Message
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
                example:
                  code: 200
                  message: 'New password has been sent to your email'
          500:
            description: Failure Message
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Message'
        """

        try:
            args = self.parser_post.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            # create new password
            password = auth_utils.generate_password()
            password_encrypted = generate_password_hash(password)

            # verify whether the email exists
            email = args['email']
            user = schema.User.find_one(email=email)

            # if yes, send email notification and save new password to DB
            if user:
                auth_utils.send_mail('MTV: your new password',
                                     password, user['email'])
                user['password'] = password_encrypted
                user.save()
            return {
                'message': 'password has been sent to your email',
                'code': 200
            }, 200

        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
