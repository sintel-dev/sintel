import logging

from flask_restful import Resource
from flask import request

LOGGER = logging.getLogger(__name__)


class Test(Resource):
    def get(self):
        """
        @api {get} /test/ Test get
        @apiGroup Test
        @apiVersion 1.0.0
        """

        print(request.headers.get('Authorization'))

        return {'message': request.headers.get('Authorization'), }, 200, {'username': 'dyu'}

    def post(self):
        """
        @api {post} /test/ Test post
        @apiGroup Test
        @apiVersion 1.0.0
        """

        return {'message': 'post'}, 200, {'username': 'dyu'}

    def delete(self):
        """
        @api {delete} /test/ Test delete
        @apiGroup Test
        @apiVersion 1.0.0
        """

        return {'message': 'delete'}, 200, {'username': 'dyu'}

    def put(self):
        """
        @api {put} /test/ Test put
        @apiGroup Test
        @apiVersion 1.0.0
        """

        return {'message': 'put'}, 200, {'username': 'dyu'}
