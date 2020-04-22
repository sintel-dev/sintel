import random
import string
import logging
import json
import requests
import os

from flask_restful import Resource
from flask import Flask, request, redirect, url_for
from mtv import model, g
from mtv.resources import auth_utils


LOGGER = logging.getLogger(__name__)


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
            password = auth_utils.generate_password()
            password_encrypted = auth_utils.generate_password_hash(password)
            user = dict()
            user['email'] = body['email']
            user['name'] = body['name']
            user['password'] = password_encrypted
            if (model.User.find_one(email=user['email'])):
                raise('email already exist')

            model.User.insert(**user)
            auth_utils.send_mail('MTV: your password', password, user['email'])
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
            if user and auth_utils.check_password_hash(user.password, password):
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
        @api {post} /auth/reset/ Reset password
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
            password_encrypted = auth_utils.generate_password_hash(password)
            email = body['email']
            user = model.User.find_one(email=email)
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
        @api {post} /auth/signout/ User signout
        @apiName UserSignout
        @apiGroup User
        @apiVersion 1.0.0

        @apiParam {String} id user id.
        """

        res, status = auth_utils.verify_auth()
        if status == 401:
            return res, status

        return {}, 204


class GoogleLogin(Resource):
    """
        @api {post} /auth/google_login/ google login
        @apiName GoogleLogin
        @apiGroup User
        @apiVersion 1.0.0
    """

    def get(self):
        # Find out what URL to hit for Google login
        google_provider_cfg = auth_utils.get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        # Use library to construct the request for Google login and provide
        # scopes that let you retrieve user's profile from Google
        request_uri = g['client'].prepare_request_uri(
            authorization_endpoint,
            redirect_uri=request.base_url + "callback/",
            scope=["openid", "email", "profile"],
        )
        return redirect(request_uri)


class GoogleAuthentication(Resource):
    def post(self):
        body = request.json

        # import pudb;
        # pudb.set_trace();
        # Temporarily addressed google auth
        token = auth_utils.generate_auth_token(str(body['gid'])).decode()
        return token

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
        google_provider_cfg = auth_utils.get_google_provider_cfg()
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
            auth=(g['config']['GOOGLE_CLIENT_ID'], os.environ['GOOGLE_CLIENT_SECRET']),
            # auth=(g['config']['GOOGLE_CLIENT_ID'], g['config']['GOOGLE_CLIENT_SECRET']),
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
        user = dict()
        user['email'] = users_email
        user['name'] = users_name
        user['gid'] = unique_id
        user['picture'] = picture

        if (not model.User.find_one(email=user['email'])):
            model.User.insert(**user)

        # return redirect(url_for('index'))
        return redirect('http://127.0.0.1:3001/')
