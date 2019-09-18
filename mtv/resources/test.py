import logging

from flask import request
from flask_restful import Resource

LOGGER = logging.getLogger(__name__)


class Test(Resource):
    def get(self):
        """
        @api {get} /test/ get
        @apiGroup Test
        @apiVersion 1.0.0
        """

        # Set the response code to 201 and return custom headers
        return {'task': 'Hello world'}, 201, {'Etag': 'some-opaque-string'}

    def post(self):
        """
        @api {post} /test/ post
        @apiGroup Test
        @apiVersion 1.0.0

        @apiParam {String} event (*required) Event ID.
        """

        body = request.json
        request.form

        if body is not None:
            event = body.get('event', None)
        else:
            if 'event' in request.form:
                event = request.form['event']

        if (event is None):
            return {'message': 'hey error!'}, 404
        # Set the response code to 201 and return custom headers
        return {'event': event}, 200

    def delete(self):
        LOGGER.info('Test DELETE')
        return 'delete'

    def put(self):
        LOGGER.info('Test PUT')
        return 'put'
