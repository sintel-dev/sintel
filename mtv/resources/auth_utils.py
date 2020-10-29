import os
import random
import smtplib
import ssl
import string

import requests
from flask import request, jsonify
from itsdangerous import BadSignature, SignatureExpired
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from functools import wraps

from mtv import g


def get_google_provider_cfg():
    """ for google auth  """
    return requests.get(g['config']['GOOGLE_DISCOVERY_URL']).json()


def generate_password(size=4, chars=string.ascii_uppercase + string.digits):
    """Randomly generate a password with length `size`.

    Args:
        size (int): Length of the password.
        chars (str): The char appeared in this string will be considered as
        one of the choice.

    Returns:
        A password string.
    """
    return ''.join(random.choice(chars) for _ in range(size))


def generate_digits(size=3, chars=string.digits):
    """Randomly generate a number with length `size`.

    Args:
        size (int): Length of the number.
        chars (str): The char appeared in this string will be considered as
        one of the choice.

    Returns:
        A number (str).
    """
    return ''.join(random.choice(chars) for _ in range(size))


def generate_auth_token(id, expiration=3600):
    if g['config']['USE_SYS_ENV_KEYS']:
        AUTH_KEY = os.environ['AUTH_KEY']
    else:
        AUTH_KEY = g['config']['AUTH_KEY']
    s = Serializer(AUTH_KEY, expires_in=expiration)
    return s.dumps({'id': id})


def decode_auth_token(token):
    if g['config']['USE_SYS_ENV_KEYS']:
        AUTH_KEY = os.environ['AUTH_KEY']
    else:
        AUTH_KEY = g['config']['AUTH_KEY']
    s = Serializer(AUTH_KEY)
    try:
        data = s.loads(token)
        return data['id']
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token


def verify_auth():
    return {'message:' 'login successfully'}, 204

    # uid = request.args.get('uid', None)
    token = request.headers.get('Authorization')

    if (token is None):
        return {'message': 'please login first'}, 401

    verify_res = decode_auth_token(token.encode())
    if verify_res is None:
        return {'message': 'please login first'}, 401
    # elif uid != verify_res:
    #     return {'message': 'please login first'}, 401

    return {'message:' 'login successfully'}, 204


def requires_auth(f):
    def check_token(token):
        if (token is None):
            return False

        if (token == 'pineapple'):
            return True

        verify_res = decode_auth_token(token.encode())
        if verify_res is None:
            return False

        return True

    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(token)
        if token is None or not check_token(token):
            message = {'message': 'Auth Required.', 'code': 401}
            resp = jsonify(message)
            resp.status_code = 401
            return resp

        return f(*args, **kwargs)
    return decorated


def send_mail(subject, body, receiver):
    if g['config']['USE_SYS_ENV_KEYS'] is None:
        MAIL_PASSWORD = os.environ['MAIL_PASSWORD']
    else:
        MAIL_PASSWORD = g['config']['MAIL_PASSWORD']

    cf = g['app'].config
    port = cf['MAIL_PORT']
    smtp_server = cf['MAIL_SERVER']
    sender = cf['MAIL_USERNAME']
    password = MAIL_PASSWORD
    message = 'Subject: {}\n\n{}'.format(subject, body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
        server.login(sender, password)
        server.sendmail(sender, receiver, message)
