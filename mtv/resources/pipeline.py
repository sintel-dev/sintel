import logging

from flask_restful import Resource

from mtv import model
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


def get_pipeline(pipeline_doc):
    return {
        'id': str(pipeline_doc.id),
        'insert_time': pipeline_doc.insert_time.isoformat(),
        'name': pipeline_doc.name,
        'created_by': pipeline_doc.created_by,
        'mlpipeline': pipeline_doc.mlpipeline
    }


class Pipeline(Resource):
    def get(self, pipeline_name):
        """
        @api {get} /pipelines/:pipeline_name/ Get pipeline by name
        @apiName GetPipeline
        @apiGroup Pipeline
        @apiVersion 1.0.0

        @apiParam {String} pipeline_name Pipeline name.

        @apiSuccess {String} id Pipeline ID.
        @apiSuccess {String} insert_time Pipeline creation time.
        @apiSuccess {String} name Pipeline name.
        @apiSuccess {String} created_by User ID.
        @apiSuccess {Object} mlpipeline Pipeline structures and hyperparameters.
        @apiSuccess {String[]} mlpipeline.primitives Primitive names.
        @apiSuccess {Object} mlpipeline.init_params Primitive hyperparameters.
        @apiSuccess {Object} mlpipeline.output_names Primitive output names.
        @apiSuccess {Object} mlpipeline.outputs Primitive outputs.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        document = model.Pipeline.find_one(name=pipeline_name)

        if document is None:
            LOGGER.exception('Error getting pipeline. '
                             'Pipeline %s does not exist.', pipeline_name)
            return {
                'message': 'Pipeline {} does not exist'.format(pipeline_name)
            }, 400

        try:
            res = get_pipeline(document)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return res


class Pipelines(Resource):
    def get(self):
        """
        @api {get} /pipelines/ Get pipelines
        @apiName GetPipelines
        @apiGroup Pipeline
        @apiVersion 1.0.0

        @apiSuccess {Object[]} pipelines Pipeline list
        @apiSuccess {String} pipelines.id Comment ID.
        @apiSuccess {String} pipelines.insert_time Pipeline creation time.
        @apiSuccess {String} pipelines.name Pipeline name.
        @apiSuccess {String} pipelines.created_by User ID.
        @apiSuccess {Object} pipelines.mlpipeline Pipeline structures and hyperparameters.
        @apiSuccess {String[]} pipelines.mlpipeline.primitives Primitive names.
        @apiSuccess {Object} pipelines.mlpipeline.init_params Primitive hyperparameters.
        @apiSuccess {Object} pipelines.mlpipeline.output_names Primitive output names.
        @apiSuccess {Object} pipelines.mlpipeline.outputs Primitive outputs.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        documents = model.Pipeline.find()

        try:
            pipelines = [get_pipeline(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'pipelines': pipelines}
