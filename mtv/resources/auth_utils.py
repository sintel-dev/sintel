import requests
import smtplib
import ssl
import string
import random
import os

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from flask import request
from mtv import g
from werkzeug.security import generate_password_hash, check_password_hash


def get_google_provider_cfg():
    """ for google auth  """
    return requests.get(g['config']['GOOGLE_DISCOVERY_URL']).json()


def generate_password(size=8, chars=string.ascii_uppercase + string.digits):
    """Randomly generate a password with length `size`.

    Args:
        size (int): Length of the password.
        chars (str): The char appeared in this string will be considered as
        one of the choice.

    Returns:
        A password string.
    """
    return ''.join(random.choice(chars) for _ in range(size))


def generate_auth_token(id, expiration=600):
    s = Serializer(os.environ['AUTH_KEY'], expires_in=expiration)
    # s = Serializer(g['config']['AUTH_KEY'], expires_in=expiration)
    return s.dumps({'id': id})


def decode_auth_token(token):
    s = Serializer(os.environ['AUTH_KEY'])
    # s = Serializer(g['config']['AUTH_KEY'])
    try:
        data = s.loads(token)
        return data['id']
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token


def verify_auth():
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


def send_mail(subject, body, receiver):
    cf = g['app'].config
    port = cf['MAIL_PORT']
    smtp_server = cf['MAIL_SERVER']
    sender = cf['MAIL_USERNAME']
    # password = cf['MAIL_PASSWORD']
    password = os.environ['MAIL_PASSWORD']
    message = 'Subject: {}\n\n{}'.format(subject, body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
        server.login(sender, password)
        server.sendmail(sender, receiver, message)
