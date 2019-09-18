import logging

from flask_restful import Resource

LOGGER = logging.getLogger(__name__)


class Dataset(Resource):
    def get(self, dataset):
        """ GET /api/v1/datasets/<dataset:string>/ """

    def delete(self, dataset):
        """ DEL /api/v1/datasets/<dataset:string>/ """

    def put(self, dataset):
        """ PUT /api/v1/datasets/<dataset:string>/ """


class Datasets(Resource):
    def get(self):
        """ GET /api/v1/datasets/ """
