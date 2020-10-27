import logging

from flask_restful import Resource
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


class Test(Resource):

    def get(self):
        """
        Example using a dictionary as specification
        This is the description
        You can also set 'summary' and 'description' in
        specs_dict
        ---
        # values here overrides the specs dict
        deprecated: true
        """
        res, status = verify_auth()
        if status == 401:
            return res, status

        return {'message': 'auth pass'}, 200

    def post(self):
        """
        MTV Test Post
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
        MTV Test Del
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
        MTV Test Put
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
