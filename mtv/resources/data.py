import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv.db import schema
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

        experiment_doc = schema.Experiment.find_one(id=ObjectId(eid))

        dataruns = list()
        datasets = list()
        raws = list()
        predictions = list()
        events = list()

        datarun_docs = schema.Datarun.find(experiment=experiment_doc.id)
        for datarun_doc in datarun_docs:
            signalrun_docs = schema.Signalrun.find(datarun=datarun_doc.id)
            for signalrun_doc in signalrun_docs:
                dataruns.append({
                    'id': str(signalrun_doc.id),
                    'dataset': datarun_doc.dataset.name,
                    'insert_time': signalrun_doc.insert_time.isoformat(),
                    'start_time': signalrun_doc.start_time.isoformat(),
                    'end_time': signalrun_doc.end_time.isoformat(),
                    'status': signalrun_doc.status,
                    'created_by': signalrun_doc.created_by,
                    'events': signalrun_doc.num_events,
                    'pipeline': str(experiment_doc.template.id)
                })

                datasets.append({
                    'name': datarun_doc.dataset.name,
                    'start_time': datarun_doc.dataset.start_time,
                    'stop_time': datarun_doc.dataset.stop_time,
                    'created_by': datarun_doc.dataset.created_by,
                })

                # fetch raw
                docs = schema.Period.find(
                    signalrun=signalrun_doc.id).order_by('+year')
                raw = list()
                for doc in docs:
                    raw.append({
                        'year': doc.year,
                        'data': doc.data
                    })
                raws.append(raw)

                # fetch prediction
                doc = schema.Prediction.find_one(signalrun=signalrun_doc.id)
                predictions.append({
                    'names': doc.names,
                    'data': doc.data,
                    'offset': doc.offset
                })

                # fetch event
                docs = schema.Event.find(signalrun=signalrun_doc.id).order_by('+start_time')
                event = list()
                for doc in docs:
                    event.append({
                        'start_time': doc.start_time,
                        'stop_time': doc.stop_time,
                        'score': doc.severity,
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
