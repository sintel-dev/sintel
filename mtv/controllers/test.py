import logging

from flask_restful import Resource

LOGGER = logging.getLogger(__name__)


class Test(Resource):
    def get(self):
        LOGGER.info('Test GET')
        return 'get'

    def post(self):
        LOGGER.info('Test POST')
        return 'post'

    def delete(self):
        LOGGER.info('Test DELETE')
        return 'delete'

    def put(self):
        LOGGER.info('Test PUT')
        return 'put'
