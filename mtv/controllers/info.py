
import logging
import pandas as pd
from flask import request
from flask_restful import Resource
from mtv.utils import get_dirs, get_files
from mtv import model
from mtv.utils import json_encoder
from bson import ObjectId

LOGGER = logging.getLogger(__name__)


class Datasets(Resource):
    def get(self):
        """ Return database list.
        
        GET /api/v1/datasets/
        """

        documents = model.Dataset.find()

        names = list()
        for document in documents:
            doc = model.Dataset.find_one(name=document.name)
            # only add dataset with some dataruns
            if doc is not None:
                names.append(document.name)

        return names

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
                'insert_time': document.insert_time.isoformat()
            })

        return docs

class Data(Resource):
    def get(self, dataset, datarun):
        ''' Return data.

        GET /api/v1/datasets/<string:dataset>/dataruns/<string:datarun>/
        '''

        data = dict()

        year = request.args.get('year', None)
        month = request.args.get('month', None)

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

class Pipelines(Resource):
    pass

class Events(Resource):
    pass
