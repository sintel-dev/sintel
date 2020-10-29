import logging

from flask_restful import Resource

from mtv.db import schema
from mtv.resources.auth_utils import requires_auth

LOGGER = logging.getLogger(__name__)


def get_pipeline(pipeline_doc):
    return {
        'id': str(pipeline_doc.id),
        'insert_time': pipeline_doc.insert_time.isoformat(),
        'name': pipeline_doc.name,
        'created_by': pipeline_doc.created_by,
        # TODO syntex error position
        # 'mlpipeline': pipeline_doc.json
    }


class Pipeline(Resource):

    @requires_auth
    def get(self, pipeline_name):
        """
        Get a pipeline by name
        ---
        tags:
          - pipeline
        security:
          - tokenAuth: []
        parameters:
          - name: pipeline_name
            in: path
            schema:
              type: string
            required: true
            description: name of the pipeline to get
        responses:
          200:
            description: Pipeline to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Pipeline'
          400:
            $ref: '#/components/responses/ErrorMessage'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        document = schema.Template.find_one(name=pipeline_name)

        if document is None:
            LOGGER.exception('Error getting pipeline. '
                             'Pipeline %s does not exist.', pipeline_name)
            return {
                'message': 'Pipeline {} does not exist'.format(pipeline_name),
                'code': 400
            }, 400

        try:
            res = get_pipeline(document)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
        else:
            return res


class Pipelines(Resource):

    @requires_auth
    def get(self):
        """
        Get a pipeline by name
        ---
        tags:
          - pipeline
        security:
          - tokenAuth: []
        responses:
          200:
            description: A list of pipelines
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    pipelines:
                      type: array
                      items:
                        $ref: '#/components/schemas/Pipeline'
          400:
            $ref: '#/components/responses/ErrorMessage'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        documents = schema.Template.find()

        try:
            pipelines = [get_pipeline(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
        else:
            return {'pipelines': pipelines}, 200
