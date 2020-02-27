import random
import string
import logging

from flask_restful import Resource
from flask import Flask, request
from mtv.utils import send_mail, generate_auth_token, verify_auth_token
from mtv import model
# from passlib.hash import sha256_crypt
from werkzeug.security import generate_password_hash, check_password_hash


LOGGER = logging.getLogger(__name__)


def pwd_generator(size=8, chars=string.ascii_uppercase + string.digits):
    """Randomly generate a password with length `size`.

    Args:
        size (int): Length of the password.
        chars (str): The char appeared in this string will be considered as 
        one of the choice.

    Returns:
        A password string.
    """
    return ''.join(random.choice(chars) for _ in range(size))


class Reset(Resource):
    def post(self):
        """
        @api {post} /auth/reset/ Reset password 
        @apiName ResetPassword
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} email email address.
        """

        verify_res = verify_auth_token(request.headers.get('Authorization').encode())
        if verify_res is None:
            return {'message': 'please login first'}, 401

        body = request.json
        try:
            password = pwd_generator()
            password_encrypted = generate_password_hash(password)
            email = body['email']
            user = model.User.find_one(email=email)
            if user:
                user['password'] = password_encrypted
                user.save()
                send_mail('MTV: your new password', password, user['email'])
            return {}, 204
        except Exception as e:
            LOGGER.exception(e)
            return {}, 204


class Signout(Resource):
    def get(self):
        """
        @api {post} /auth/signout/ User signout
        @apiName UserSignout
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} id user id.
        """

        # print(request.headers.get('Authorization'))
        uid = request.args.get('id', None)

        verify_res = verify_auth_token(request.headers.get('Authorization').encode())
        if verify_res is None:
            return {'message': 'please login first'}, 401
        elif uid == verify_res:
            return {}, 204

        return {'message': 'unknown error'}, 400


class Signup(Resource):
    def post(self):
        """
        @api {post} /auth/signup/ User signup
        @apiName UserSignup
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} email email address.
        @apiParam {String} name  user name.
        """

        body = request.json
        try:
            password = pwd_generator()
            password_encrypted = generate_password_hash(password)
            user = dict()
            user['email'] = body['email']
            user['name'] = body['name']
            user['password'] = password_encrypted
            if (model.User.find_one(email=user['email'])):
                raise('email already exist')

            model.User.insert(**user)
            send_mail('MTV: your password', password, user['email'])
            return {'message': 'password has been sent to your email'}, 200
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400


class Signin(Resource):
    def post(self):
        """
        @api {post} /auth/signin/ User signin
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
            user = model.User.find_one(email=email)
            if user and check_password_hash(user.password, password):
                token = generate_auth_token(str(user.id)).decode()
                return {
                    'data': {
                        'id': str(user.id),
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
