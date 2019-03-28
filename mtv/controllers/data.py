import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Data(Resource):
    def get(self):
        ''' Return data required by visualization.

        GET /api/v1/data/?dataset=xxx&datarun=xxx
        '''

        dataset = request.args.get('dataset', None)
        datarun = request.args.get('datarun', None)

        if (datarun is None or datarun is None):
            LOGGER.exception('Error querying data. '
                             'Need to specify the dataset and datarun')
            raise

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
