import logging

from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Dataset(Resource):
    def get(self, dataset):
        """ GET /api/v1/datasets/<dataset:string>/ """

    def delete(self, dataset):
        """ DEL /api/v1/datasets/<dataset:string>/ """
        return 'delete'

    def put(self, dataset):
        """ PUT /api/v1/datasets/<dataset:string>/ """
        return 'put'


class Datasets(Resource):
    def get(self):
        """ GET /api/v1/datasets/ """

        documents = model.Dataset.find()

        docs = list()
        for document in documents:
            docs.append({
                'id': str(document.id),
                'insert_time': document.insert_time.isoformat(),
                'name': document.name,
                'signal_set': document.signal_set,
                'start_time': document.start_time,
                'stop_time': document.stop_time,
                'created_by': document.created_by
            })

        return docs
