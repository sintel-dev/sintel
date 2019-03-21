
import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Datasets(Resource):
    def get(self):
        """ Return database list.

        GET /api/v1/datasets/
        """

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


class Dataruns(Resource):
    def get(self, dataset):
        """ Return datarun list of a given dataset.

        GET /api/v1/datasets/<string:dataset>/dataruns/
        """

        document = model.Dataset.find_one(name=dataset)

        if document is None:
            return []

        dataset_id = document.id

        query = {
            'dataset': dataset_id
        }

        documents = model.Datarun.find(**query)

        docs = list()
        for document in documents:
            docs.append({
                'id': str(document.id),
                'insert_time': document.insert_time.isoformat(),
                'start_time': document.start_time.isoformat(),
                'end_time': document.end_time.isoformat(),
                'status': document.status,
                'created_by': document.created_by,
                'events': document.events,
                'pipeline': str(document.pipeline.id)
            })

        return docs


class Pipeline(Resource):
    def get(self, pipeline):
        """ Return the pipeline information by given a pipeline id.

        GET /api/v1/pipelines/<string:pipeline>/
        """

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


class Data(Resource):
    def get(self, dataset, datarun):
        ''' Return data.

        GET /api/v1/datasets/<string:dataset>/dataruns/<string:datarun>/
        '''

        request.args.get('year', None)
        request.args.get('month', None)

        # fetch collection "raw"
        query = {
            'dataset': dataset
        }
        documents = model.Raw.find(**query).order_by('+year')

        raw = list()
        for document in documents:
            raw.append({
                'year': document.year,
                'data': document.data
            })
        print('***********%%%%%%%%%%************', dataset, len(raw))

        # fetch collection "prediction"
        query = {
            'dataset': dataset,
            'datarun': ObjectId(datarun)
        }
        document = model.Prediction.find_one(**query)

        prediction = {
            'names': document.names,
            'data': document.data,
            'offset': document.offset
        }

        # fetch collection "events"
        query = {
            'datarun': ObjectId(datarun)
        }
        documents = model.Event.find(**query).order_by('+start_time')
        events = list()
        for document in documents:
            events.append({
                'start_time': document.start_time,
                'stop_time': document.stop_time,
                'score': document.score,
                'id': str(document.id),
            })

        return {
            'raw': raw,
            'prediction': prediction,
            'events': events,
        }
