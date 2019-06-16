import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)

class Data(Resource):
    def get(self):
        ''' Return data required by visualization.

        GET /api/v1/data/?station=xxx&experiment=xxx
        '''
        station = request.args.get('station', None)
        experiment = request.args.get('experiment', 'lstm_dynamic_threshold_1')

        if (station is None or experiment is None):
            LOGGER.exception('Error querying data.'
                             'Need to specify the station and experiment')
            raise

        # fetch datasets
        query = {'signal_set': station}
        datasets = model.Dataset.find(**query)

        ids = list()
        names = list()
        for d in datasets:
            names.append(d.name)
            ids.append(d.id)

        # fetch raw
        raws = dict()
        for name in names:
            query = {'dataset': name}
            documents = model.Raw.find(**query).order_by('+year')
            raw = list()
            for d in documents:
                raw.append({
                    'year': d.year,
                    'data': d.data
                })
            raws[name] = raw
        
        # fetch prediction and events
        predictions = dict()
        events = dict()
        dataruns = dict()
        for i, datasetId in enumerate(ids):
            # find corresponding datarun
            query = {
                'experiment': experiment,
                'dataset': datasetId
            }
            datarun = model.Datarun.find_one(**query)
            dataruns[names[i]] = str(datarun.id)

            # prediction
            query = {
                'dataset': names[i],
                'datarun': datarun.id
            }
            d = model.Prediction.find_one(**query)
            if (d is None):
                prediction = {
                    'data': [],
                }
            else:
                prediction = {
                    'names': d.names,
                    'data': d.data,
                    'offset': d.offset
                }
            predictions[names[i]] = prediction

            # event
            query = {
                'datarun': datarun.id
            }
            documents = model.Event.find(**query).order_by('+start_time')
            event = list()
            for d in documents:
                event.append({
                    'start_time': d.start_time,
                    'stop_time': d.stop_time,
                    'score': d.score,
                    'id': str(d.id),
                })
            events[names[i]] = event


        return {
            'raws': raws,
            'predictions': predictions,
            'events': events,
            'dataruns': dataruns
        }
    
    def post(self):
        ''' Return data required by visualization.

        POST /api/v1/data/?station=xxx&experiment=xxx
        '''
        station = request.args.get('station', None)
        experiment = request.args.get('experiment', 'lstm_dynamic_threshold_1')

        if (station is None or experiment is None):
            LOGGER.exception('Error querying data.'
                             'Need to specify the station and experiment')
            raise

        # fetch datasets
        query = {'signal_set': station}
        datasets = model.Dataset.find(**query)

        ids = list()
        names = list()
        for d in datasets:
            names.append(d.name)
            ids.append(d.id)

        # fetch raw
        raws = dict()
        for name in names:
            query = {'dataset': name}
            documents = model.Raw.find(**query).order_by('+year')
            raw = list()
            for d in documents:
                raw.append({
                    'year': d.year,
                    'data': d.data
                })
            raws[name] = raw
        
        # fetch prediction and events
        predictions = dict()
        events = dict()
        dataruns = dict()
        for i, datasetId in enumerate(ids):
            # find corresponding datarun
            query = {
                'experiment': experiment,
                'dataset': datasetId
            }
            datarun = model.Datarun.find_one(**query)
            dataruns[names[i]] = str(datarun.id)

            # prediction
            query = {
                'dataset': names[i],
                'datarun': datarun.id
            }
            d = model.Prediction.find_one(**query)
            if (d is None):
                prediction = {
                    'data': [],
                }
            else:
                prediction = {
                    'names': d.names,
                    'data': d.data,
                    'offset': d.offset
                }
            predictions[names[i]] = prediction

            # event
            query = {
                'datarun': datarun.id
            }
            documents = model.Event.find(**query).order_by('+start_time')
            event = list()
            for d in documents:
                event.append({
                    'start_time': d.start_time,
                    'stop_time': d.stop_time,
                    'score': d.score,
                    'id': str(d.id),
                })
            events[names[i]] = event

        return {
            'raws': raws,
            'predictions': predictions,
            'events': events,
            'dataruns': dataruns
        }
