import logging

from flask_restful import Resource

LOGGER = logging.getLogger(__name__)


class Signal(Resource):
    def get(self, signal):
        """ GET /api/v1/signals/<signal:string>/ """

    def delete(self, signal):
        """ DEL /api/v1/signals/<signal:string>/ """

    def put(self, signal):
        """ PUT /api/v1/signals/<signal:string>/ """


class Signals(Resource):
    def get(self):
        """ GET /api/v1/signals/ """
