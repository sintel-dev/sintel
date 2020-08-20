import json
import logging
import os

import requests
from flask import redirect, request
from flask_restful import Resource

from mtv import g
from mtv.db import schema
from mtv.resources import auth_utils

LOGGER = logging.getLogger(__name__)


class GoogleAuthentication(Resource):
    def post(self):
        body = request.json

        # signup
        try:
            user = dict()
            user['email'] = body.get('email', None)
            user['name'] = body.get('name', None)
            user['gid'] = body.get('gid', None)
            user['picture'] = body.get('picture', None)

            if (user['email'] is None or user['gid'] is None or user['name'] is None):
                raise Exception('user information is missing')

            if schema.User.find_one(gid=user['gid']):
                db_user = schema.User.find_one(gid=user['gid'])
            else:
                # write into db
                origin_name = user['name']
                # keep finding until we find the one unique
                while schema.User.find_one(name=user['name']):
                    user['name'] = origin_name + auth_utils.generate_digits()
                schema.User.insert(**user)
                db_user = schema.User.find_one(gid=user['gid'])

            token = auth_utils.generate_auth_token(str(db_user.id)).decode()
            return {
                'data': {
                    'uid': str(db_user.id),
                    'name': db_user.name,
                    'email': db_user.email,
                    # 'picture': db_user.picture,
                    'token': token
                }
            }, 200
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 401


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
        if g['config']['USE_SYS_ENV_KEYS']:
            GOOGLE_CLIENT_SECRET = g['config']['GOOGLE_CLIENT_SECRET']
        else:
            GOOGLE_CLIENT_SECRET = os.environ['GOOGLE_CLIENT_SECRET']
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(g['config']['GOOGLE_CLIENT_ID'], GOOGLE_CLIENT_SECRET)
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

        if (not schema.User.find_one(email=user['email'])):
            schema.User.insert(**user)

        # return redirect(url_for('index'))
        return redirect('http://127.0.0.1:3001/')
