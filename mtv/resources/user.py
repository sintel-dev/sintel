import random
import string
import logging
import requests
import json

from flask_restful import Resource
from flask import Flask, request, redirect, url_for
from mtv.utils import send_mail, generate_auth_token, verify_auth_token
from mtv import model
from mtv import g
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


def get_google_provider_cfg():
    return requests.get(g['config']['GOOGLE_DISCOVERY_URL']).json()


class GoogleLogin(Resource):
    """
        @api {post} /auth/google_login/ google login 
        @apiName GoogleLogin
        @apiGroup User
        @apiVersion 1.0.0
    """

    def get(self):
        # Find out what URL to hit for Google login
        google_provider_cfg = get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        # Use library to construct the request for Google login and provide
        # scopes that let you retrieve user's profile from Google
        request_uri = g['client'].prepare_request_uri(
            authorization_endpoint,
            redirect_uri=request.base_url + "callback/",
            scope=["openid", "email", "profile"],
        )
        return redirect(request_uri)


class GoogleLoginCallback(Resource):
    """
        @api {post} /auth/google_login/callback google login 
        @apiName GoogleLogin
        @apiGroup User
        @apiVersion 1.0.0
    """

    def get(self):
        # Get a unique code from Google
        code = request.args.get('code')

        # Find out what URL to hit to get tokens that allow you to ask for
        # things on behalf of a user
        google_provider_cfg = get_google_provider_cfg()
        token_endpoint = google_provider_cfg["token_endpoint"]

        # Prepare and send a request to get tokens! Yay tokens!
        token_url, headers, body = g['client'].prepare_token_request(
            token_endpoint,
            authorization_response=request.url,
            redirect_url=request.base_url,
            code=code
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(g['config']['GOOGLE_CLIENT_ID'], g['config']['GOOGLE_CLIENT_SECRET']),
        )

        # Parse the tokens!
        g['client'].parse_request_body_response(json.dumps(token_response.json()))

        # Find and hit the URL
        # from Google that gives you the user's profile information,
        # including their Google profile image and email
        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = g['client'].add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        # Make sure their email is verified.
        # The user authenticated with Google, authorized your
        # app, and now you've verified their email through Google!
        if userinfo_response.json().get("email_verified"):
            unique_id = userinfo_response.json()["sub"]
            users_email = userinfo_response.json()["email"]
            picture = userinfo_response.json()["picture"]
            users_name = userinfo_response.json()["given_name"]
        else:
            return "User email not available or not verified by Google.", 400

        # if not in db, create the user with unique_id
        # print(unique_id, users_email, users_name)
        # print(type(picture))    # base64 string
        # otherwise, back to index page
        return redirect(url_for('index'))


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
