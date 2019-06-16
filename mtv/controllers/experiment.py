import logging

from bson import ObjectId
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Experiment(Resource):
    def get(self, experiment):
        """  GET /api/v1/experiments/<string:experiment>/ """

        query = {
            'name': experiment
        }

        document = model.Experiment.find_one(**query)

        if document is None:
            return False

        return {
            'name': document.name,
            'model_num': document.model_num,
            'event_num': document.event_num,
            'pipeline': {
                'name': document.pipeline.name,
                'mlpipeline': document.pipeline.mlpipeline
            },
            'start_time': document.start_time.isoformat(),
            'end_time': document.start_time.isoformat(),
            'created_by': document.created_by
        }


class Experiments(Resource):

    def get(self):
        """ Return experiment list
            
        GET /api/v1/experiments/ 
        """
        
        documents = model.Experiment.find()

        docs = list()
        for document in documents:
            docs.append({
                'name': document.name,
                'model_num': document.model_num,
                'event_num': document.event_num,
                'pipeline': {
                    'name': document.pipeline.name,
                    'mlpipeline': document.pipeline.mlpipeline
                },
                'start_time': document.start_time.isoformat(),
                'end_time': document.start_time.isoformat(),
                'created_by': document.created_by
            })
        
        return docs
