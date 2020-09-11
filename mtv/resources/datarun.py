import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv.db import DBExplorer, schema
from mtv.resources.auth_utils import verify_auth
from mtv.resources.computing.utils.layout import tsne
from mtv.resources.experiment import validate_experiment_id

LOGGER = logging.getLogger(__name__)


def get_signalrun(signalrun_doc):
    signalrun = {
        'id': str(signalrun_doc.id),
        'experiment': str(signalrun_doc.datarun.experiment.id),
        'signal': signalrun_doc.signal.name,
        'start_time': signalrun_doc.start_time.isoformat(),
        'end_time': signalrun_doc.end_time.isoformat(),
        'status': signalrun_doc.status,
        'events': [],
        'prediction': None,
        'raw': []
    }

    # get events of this signalrun
    event_docs = schema.Event.find(signalrun=signalrun_doc.id)
    if event_docs is not None:
        for event_doc in event_docs:
            # TODO
            # annotation_doc = schema.Annotation.find_one(event=event_doc.id)
            signalrun['events'].append({
                'id': str(event_doc.id),
                'start_time': event_doc.start_time,
                'stop_time': event_doc.stop_time,
                'score': event_doc.severity,
                'tag': event_doc.tag,
                'source': event_doc.source,
                'signalrunID': str(event_doc.signal.id)
            })
            # signalrun['events'][-1]['tag'] = \
            #     None if annotation_doc is None else annotation_doc.tag

    # get prediction
    prediction_data = DBExplorer.get_prediction(signalrun_doc)
    # prediction_doc = schema.Prediction.find_one(signalrun=signalrun_doc.id)
    signalrun['prediction'] = {
        'names': prediction_data['attrs'],
        'data': prediction_data['data']
    }

    # get raw
    period_docs = schema.Period.find(signalrun=signalrun_doc.id).order_by('+year')
    for period_doc in period_docs:
        signalrun['raw'].append({
            'timestamp': period_doc.timestamp,
            'year': period_doc.year,
            'data': period_doc.data
        })

    return signalrun


def get_datarun(datarun_doc):
    signalruns = list()
    signalrun_docs = schema.Signalrun.find(datarun=datarun_doc.id)
    for signalrun_doc in signalrun_docs:
        signalrun = get_signalrun(signalrun_doc)
        signalruns.append(signalrun)

    # TODO: add option
    if len(signalruns) > 1:
        signalruns = tsne(signalruns)
    return signalruns


def validate_datarun_id(datarun_id):
    try:
        did = ObjectId(datarun_id)
    except Exception as e:
        LOGGER.exception(e)
        return {'message': str(e)}, 400

    datarun_doc = schema.Signalrun.find_one(id=did)

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

        res, status = verify_auth()
        if status == 401:
            return res, status
        # validate datarun_id
        validate_result = validate_datarun_id(datarun_id)
        if validate_result[1] == 400:
            return validate_result

        datarun_doc = validate_result[0]

        # return result
        try:
            res = get_signalrun(datarun_doc)
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

        res, status = verify_auth()
        if status == 401:
            return res, status
        experiment_id = request.args.get('experiment_id', None)

        # validate experiment_id
        validate_result = validate_experiment_id(experiment_id)
        if validate_result[1] == 400:
            return validate_result

        experiment_doc = validate_result[0]

        datarun_docs = schema.Datarun.find(experiment=experiment_doc.id)

        try:
            dataruns = list()
            for datarun_doc in datarun_docs:
                dataruns.extend(get_datarun(datarun_doc))
            # dataruns = [get_datarun(datarun_doc) for datarun_doc in datarun_docs]
            # sort by signal name
            # dataruns.sort(key=lambda x: x['signal'], reverse=False)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'dataruns': dataruns}
