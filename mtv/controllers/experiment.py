import logging

from bson import ObjectId
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Experiment(Resource):
    def get(self, experiment):
        """ Return the specified experiment info 
        
        GET /api/v1/experiments/<string:experiment>/
        """

        query = {
            'name': experiment
        }

        document = model.Experiment.find_one(**query)

        # todo: throw error to front
        if document is None:
            return False

        return {
            'id': str(document.id),
            'name': document.name,
            'model_num': document.model_num,
            'event_num': document.event_num,
            'project': document.project,
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
                'id': str(document.id),
                'name': document.name,
                'model_num': document.model_num,
                'event_num': document.event_num,
                'project': document.project,
                'pipeline': {
                    'name': document.pipeline.name,
                    'mlpipeline': document.pipeline.mlpipeline
                },
                'start_time': document.start_time.isoformat(),
                'end_time': document.start_time.isoformat(),
                'created_by': document.created_by
            })
        
        return docs
