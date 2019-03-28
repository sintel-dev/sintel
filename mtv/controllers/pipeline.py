import logging

from bson import ObjectId
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Pipeline(Resource):
    def get(self, pipeline):
        """  GET /api/v1/pipelines/<string:pipeline>/ """

        pipeline_id = ObjectId(pipeline)

        document = model.Pipeline.find_one(id=pipeline_id)

        if document is None:
            return False

        return {
            'insert_time': document.insert_time.isoformat(),
            'name': document.name,
            'mlpipeline': document.mlpipeline,
            'created_by': document.created_by
        }


class Pipelines(Resource):
    """ Shows a list of comments and lets you add a new comment item"""

    def post(self):
        """ Add a new pipeline.

        POST /api/v1/pipelines/
        """
