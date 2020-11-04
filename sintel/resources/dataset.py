import logging

from flask_restful import Resource, reqparse

from sintel.db import schema
from sintel.resources.auth_utils import requires_auth

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

    @requires_auth
    def get(self, dataset_name):
        """
        Get a dataset by name
        ---
        tags:
          - dataset
        security:
          - tokenAuth: []
        parameters:
          - name: dataset_name
            in: path
            schema:
              type: string
            required: true
            description: name of the dataset to get
        responses:
          200:
            description: Dataset to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Dataset'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

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

    @requires_auth
    def get(self):
        """
        Return all datasets
        ---
        tags:
          - dataset
        security:
          - tokenAuth: []
        responses:
          200:
            description: All datasets
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    datasets:
                      type: array
                      items:
                        $ref: '#/components/schemas/Dataset'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        documents = schema.Dataset.find()

        try:
            datasets = [get_dataset(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'datasets': datasets}
