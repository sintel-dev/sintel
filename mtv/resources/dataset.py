import logging

from flask_restful import Resource

from mtv.db import schema
from mtv.resources.auth_utils import verify_auth


LOGGER = logging.getLogger(__name__)


def get_dataset(dataset_doc):
    return {
        'id': str(dataset_doc.id),
        'insert_time': dataset_doc.insert_time.isoformat(),
        'name': dataset_doc.name,
        'entity': dataset_doc.entity,
        'created_by': dataset_doc.created_by
    }


class Dataset(Resource):
    def get(self, dataset_name):
        """
        @api {get} /datasets/:dataset_name/ Get dataset by name
        @apiName GetDataset
        @apiGroup Dataset
        @apiVersion 1.0.0

        @apiParam {String} dataset_name Dataset name.

        @apiSuccess {String} id Dataset ID.
        @apiSuccess {String} insert_time Dataset creation time.
        @apiSuccess {String} name Dataset name.
        @apiSuccess {String} entity_id Dataset entity_id.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        document = schema.Dataset.find_one(name=dataset_name)

        if document is None:
            LOGGER.exception('Error getting dataset. '
                             'Dataset %s does not exist.', dataset_name)
            return {
                'message': 'Dataset {} does not exist'.format(dataset_name)
            }, 400

        try:
            res = get_dataset(document)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return res


class Datasets(Resource):
    def get(self):
        """
        @api {get} /datasets/ Get datasets
        @apiName GetDatasets
        @apiGroup Dataset
        @apiVersion 1.0.0

        @apiSuccess {Object[]} datasets Dataset list.
        @apiSuccess {String} datasets.id Dataset ID.
        @apiSuccess {String} datasets.insert_time Dataset creation time.
        @apiSuccess {String} datasets.name Dataset name.
        @apiSuccess {String} datasets.entity_id Dataset entity_id.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        documents = schema.Dataset.find()

        try:
            datasets = [get_dataset(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'datasets': datasets}
