import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model
from mtv.resources.experiment import validate_experiment_id

LOGGER = logging.getLogger(__name__)


def get_datarun(datarun_doc):
    datarun = {
        'id': str(datarun_doc.id),
        'experiment': str(datarun_doc.experiment.id),
        'signal': datarun_doc.signal.name,
        'start_time': datarun_doc.start_time.isoformat(),
        'end_time': datarun_doc.end_time.isoformat(),
        'status': datarun_doc.status,
        'events': [],
        'prediction': None,
        'raw': []
    }

    # get events
    event_docs = model.Event.find(datarun=datarun_doc.id)
    if event_docs is not None:
        for event_doc in event_docs:
            datarun['events'].append({
                'id': str(event_doc.id),
                'start_time': event_doc.start_time,
                'stop_time': event_doc.stop_time,
                'score': event_doc.score,
                'tag': event_doc.tag
            })

    # get prediction
    prediction_doc = model.Prediction.find_one(datarun=datarun_doc.id)
    datarun['prediction'] = {
        'names': prediction_doc.names,
        'data': prediction_doc.data
    }

    # get raw
    raw_docs = model.Raw.find(datarun=datarun_doc.id).order_by('+year')
    for raw_doc in raw_docs:
        datarun['raw'].append({
            'timestamp': raw_doc.timestamp,
            'year': raw_doc.year,
            'data': raw_doc.data
        })

    return datarun


def validate_datarun_id(datarun_id):
    try:
        did = ObjectId(datarun_id)
    except Exception as e:
        LOGGER.exception(e)
        return {'message': str(e)}, 400

    datarun_doc = model.Datarun.find_one(id=did)

    if datarun_doc is None:
        LOGGER.exception('Datarun %s does not exist.', datarun_id)
        return {
            'message': 'Datarun {} does not exist'.format(datarun_id)
        }, 400

    return datarun_doc, 200


class Datarun(Resource):
    def get(self, datarun_id):
        """
        @api {get} /dataruns/:datarun_id Get datarun by ID
        @apiName GetDatarun
        @apiGroup Datarun
        @apiVersion 1.0.0

        @apiParam {String} datarun_id Datarun ID.

        @apiSuccess {String} id Datarun ID.
        @apiSuccess {String} experiment Experiment id.
        @apiSuccess {String} signal Signal name.
        @apiSuccess {String} start_time Datarun start time.
        @apiSuccess {String} end_time Datarun end time.
        @apiSuccess {String} status Datarun status.
        @apiSuccess {Object[]} events Event list.
        @apiSuccess {String} events.id Event ID.
        @apiSuccess {Int} events.start_time Event start time.
        @apiSuccess {Int} events.stop_time Event stop time.
        @apiSuccess {Float} events.score Event anomaly score.
        @apiSuccess {String} events.tag Event tag.
        @apiSuccess {Object} prediction Datarun prediction result.
        @apiSuccess {String[]} prediction.names Attribute name list.
        @apiSuccess {Float[][]} prediction.data Attribute values.
        @apiSuccess {Object[]} raw Signal raw aggregated values.
        @apiSuccess {Int} raw.year The year of the storing data.
        @apiSuccess {Float} raw.timestamp The start timestamp of the year.
        @apiSuccess {Object[][]} raw.data The aggregated signal data.
        """

        # validate datarun_id
        validate_result = validate_datarun_id(datarun_id)
        if validate_result[1] == 400:
            return validate_result

        datarun_doc = validate_result[0]

        # return result
        try:
            res = get_datarun(datarun_doc)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return res


class Dataruns(Resource):
    def get(self):
        """
        @api {get} /dataruns/ Get datarun by experiment ID
        @apiName GetDatarunByExperiment
        @apiGroup Datarun
        @apiVersion 1.0.0

        @apiParam {String} experiment_id Experiment ID.

        @apiSuccess {Object[]} dataruns Datarun list.
        @apiSuccess {String} dataruns.id Datarun ID.
        @apiSuccess {String} dataruns.experiment Experiment id.
        @apiSuccess {String} dataruns.signal Signal name.
        @apiSuccess {String} dataruns.start_time Datarun start time.
        @apiSuccess {String} dataruns.end_time Datarun end time.
        @apiSuccess {String} dataruns.status Datarun status.
        @apiSuccess {Object[]} dataruns.events Event list.
        @apiSuccess {String} dataruns.events.id Event ID.
        @apiSuccess {Int} dataruns.events.start_time Event start time.
        @apiSuccess {Int} dataruns.events.stop_time Event stop time.
        @apiSuccess {Float} dataruns.events.score Event anomaly score.
        @apiSuccess {String} dataruns.events.tag Event tag.
        @apiSuccess {Object} dataruns.prediction Datarun prediction result.
        @apiSuccess {String[]} dataruns.prediction.names Attribute name list.
        @apiSuccess {Float[][]} dataruns.prediction.data Attribute values.
        @apiSuccess {Object[]} dataruns.raw Signal raw aggregated values.
        @apiSuccess {Int} dataruns.raw.year The year of the storing data.
        @apiSuccess {Float} dataruns.raw.timestamp The start timestamp of the year.
        @apiSuccess {Object[][]} dataruns.raw.data The aggregated signal data.
        """

        experiment_id = request.args.get('experiment_id', None)

        # validate experiment_id
        validate_result = validate_experiment_id(experiment_id)
        if validate_result[1] == 400:
            return validate_result

        experiment_doc = validate_result[0]

        datarun_docs = model.Datarun.find(experiment=experiment_doc.id)

        try:
            dataruns = [get_datarun(datarun_doc) for datarun_doc in datarun_docs]
            # sort by signal name
            dataruns.sort(key=lambda x: x['signal'], reverse=False)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'dataruns': dataruns}
