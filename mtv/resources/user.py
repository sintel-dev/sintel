import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource
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
    def get(self, user_id):
        """
        @api {get} /users/<:user_id>/ Get User Info
        @apiName GetUser
        @apiGroup User
        @apiVersion 1.0.0

        @apiSuccess {Object} user
        @apiSuccess {String} user.id user id.
        @apiSuccess {String} user.name user name.
        @apiSuccess {String} user.email user email.
        @apiSuccess {String} user.picture user picture.
        """
        res, status = auth_utils.verify_auth()

        if status == 401:
            return res, status
        user_doc, status = validate_user_id(user_id)
        if (status == 400):
            return {'message': 'Wrong user_id is given'}, 400

        user = get_user(user_doc)
        return {
            'user': user
        }, 200


class Users(Resource):
    """
        @api {get} /users/ Get User List
        @apiName GetUsers
        @apiGroup User
        @apiVersion 1.0.0

        @apiSuccess {Object[]} users
        @apiSuccess {String} users.id user id.
        @apiSuccess {String} users.name user name.
        @apiSuccess {String} users.email user email.
        @apiSuccess {String} users.pircture user picture.
    """

    def get(self):
        res, status = auth_utils.verify_auth()

        if status == 401:
            return res, status

        users = list()
        user_docs = schema.User.find()
        for user_doc in user_docs:
            user = get_user(user_doc)
            users.append(user)

        return {
            'users': users
        }, 200


class Signup(Resource):
    def post(self):
        """
        @api {post} /users/signup/ User signup
        @apiName UserSignup
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} email email address.
        @apiParam {String} name  user name.
        """

        body = request.json
        try:
            password = auth_utils.generate_password()
            password_encrypted = generate_password_hash(password)
            user = dict()
            user['email'] = body['email']
            user['name'] = body['name']
            user['password'] = password_encrypted
            if schema.User.find_one(email=user['email']):
                raise Exception('email already exist')
            origin_name = user['name']
            # keep finding until we find the one unique
            while schema.User.find_one(name=user['name']):
                user['name'] = origin_name + auth_utils.generate_digits()

            schema.User.insert(**user)
            auth_utils.send_mail('MTV: your password', password, user['email'])
            return {'message': 'password has been sent to your email'}, 200
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400


class Signin(Resource):
    def post(self):
        """
        @api {post} /users/signin/ User signin
        @apiName UserSignin
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} email email address.
        @apiParam {String} password password.
        @apiParam {String} rememberMe  boolean value.

        @apiSuccess {Object} data
        @apiSuccess {String} data.name user name.
        @apiSuccess {String} data.email user email.
        @apiSuccess {String} data.token token for authentication.
        """

        body = request.json
        try:
            email = body['email']
            password = body['password']
            user = schema.User.find_one(email=email)
            if user and check_password_hash(user.password, password):
                token = auth_utils.generate_auth_token(str(user.id)).decode()
                return {
                    'data': {
                        'uid': str(user.id),
                        'name': user.name,
                        'email': user.email,
                        'token': token
                    }
                }, 200
            else:
                return {'message': 'Email and/or Passkey are wrong!'}, 401
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 401


class Reset(Resource):
    def post(self):
        """
        @api {post} /users/reset/ Reset password
        @apiName ResetPassword
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} email email address.
        """

        # res, status = auth_utils.verify_auth()
        # if status == 401:
        #     return res, status

        body = request.json
        try:
            password = auth_utils.generate_password()
            password_encrypted = generate_password_hash(password)
            email = body['email']
            user = schema.User.find_one(email=email)
            if user:
                user['password'] = password_encrypted
                user.save()
                auth_utils.send_mail('MTV: your new password', password, user['email'])
            return {}, 204
        except Exception as e:
            LOGGER.exception(e)
            return {}, 204


class Signout(Resource):
    def get(self):
        """
        @api {post} /users/signout/ User signout
        @apiName UserSignout
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} id user id.
        """

        res, status = auth_utils.verify_auth()
        if status == 401:
            return res, status

        return {}, 204
