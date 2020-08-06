import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


class Data(Resource):
    def get(self):
        ''' Return data for visualization.

        GET /api/v1/data/?eid=xxx
        '''

        res, status = verify_auth()
        if status == 401:
            return res, status

        eid = request.args.get('eid', None)

        if (eid is None):
            LOGGER.exception('Error querying data.'
                             'Need to specify the experiment')
            raise

        experiment = model.Experiment.find_one(id=ObjectId(eid))

        dataruns = list()
        datasets = list()
        raws = list()
        predictions = list()
        events = list()
        for datarun in experiment.dataruns:
            dataruns.append({
                'id': str(datarun.id),
                'dataset': datarun.dataset.name,
                'insert_time': datarun.insert_time.isoformat(),
                'start_time': datarun.start_time.isoformat(),
                'end_time': datarun.end_time.isoformat(),
                'status': datarun.status,
                'created_by': datarun.created_by,
                'events': datarun.events,
                'pipeline': str(datarun.pipeline.id)
            })

            datasets.append({
                'name': datarun.dataset.name,
                'signal_set': datarun.dataset.signal_set,
                'start_time': datarun.dataset.start_time,
                'stop_time': datarun.dataset.stop_time,
                'created_by': datarun.dataset.created_by,
            })

            # fetch raw
            docs = model.Raw.find(
                dataset=datarun.dataset.name).order_by('+year')
            raw = list()
            for doc in docs:
                raw.append({
                    'year': doc.year,
                    'data': doc.data
                })
            raws.append(raw)

            # fetch prediction
            doc = model.Prediction.find_one(datarun=datarun.id)
            predictions.append({
                'names': doc.names,
                'data': doc.data,
                'offset': doc.offset
            })

            # fetch event
            docs = model.Event.find(datarun=datarun.id).order_by('+start_time')
            event = list()
            for doc in docs:
                event.append({
                    'start_time': doc.start_time,
                    'stop_time': doc.stop_time,
                    'score': doc.score,
                    'id': str(doc.id),
                })
            events.append(event)

        return {
            'datasets': datasets,
            'dataruns': dataruns,
            'raws': raws,
            'predictions': predictions,
            'events': events
        }
