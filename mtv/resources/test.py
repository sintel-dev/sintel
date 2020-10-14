import logging

from flask_restful import Resource
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


class Test(Resource):

    def get(self):
        """
        Flasgger will try to load "./apidocs/resources/test/{method}.yml" as
        swagger document
        """
        res, status = verify_auth()
        if status == 401:
            return res, status

        return {'message': 'auth pass'}, 200

    def post(self):
        """
        Test Post
        Restful APIs
        ---
        parameters:
          - in: path
            name: username
            type: string
            required: true
        responses:
          200:
            description: A single user item
            schema:
              id: User
              properties:
                username:
                  type: string
                  description: The name of the user
                  default: Steven Wilson
         """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'post'}, 200, {'username': 'dyu'}

    def delete(self):
        """
        Test Del
        Restful APIs
        ---
        responses:
          200:
            description: A message object confirming delete status
            schema:
              properties:
                message:
                  type: string
                  description: The message content
                  default: testing
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'delete'}, 200, {'username': 'dyu'}

    def put(self):
        """
        Test Put
        Restful APIs
        ---
        responses:
          200:
            description: A message object confirming delete status
            schema:
              properties:
                message:
                  type: string
                  description: The message content
                  default: testing
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'put'}, 200, {'username': 'dyu'}
