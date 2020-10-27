import logging

from flask_restful import Resource, reqparse

from mtv.db import DBExplorer, schema
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


def get_signal(signal_doc):
    return {
        'id': str(signal_doc.id),
        'insert_time': signal_doc.insert_time.isoformat(),
        'name': signal_doc.name,
        'dataset': signal_doc.dataset.name,
        'start_time': signal_doc.start_time,
        'stop_time': signal_doc.stop_time,
        'created_by': signal_doc.created_by
    }


class Signal(Resource):
    def get(self, signal_name):
        """
        Find signal by name
        ---
        tags:
          - signals
        parameters:
          - name: signal_name
            in: path
            schema:
              type: integer
        definitions:
          Signal:
            type: object
            properties:
              id:
                type: string
              insert_time:
                type: string
              name:
                type: string
              dataset:
                type: string
              start_time:
                type: string
              stop_time:
                type: string
              created_by:
                type: string
        responses:
          200:
            description: Signal
            schema:
              $ref: '#/definitions/Signal'
            examples:
              rgb: ['red', 'green', 'blue']
        """
        # """
        # @api {get} /signals/:signal_name/ Get signal by name
        # @apiName GetSignal
        # @apiGroup Signal
        # @apiVersion 1.0.0

        # @apiParam {String} signal_name Signal name.

        # @apiSuccess {String} id Signal ID.
        # @apiSuccess {String} insert_time Signal creation time.
        # @apiSuccess {String} name Signal name.
        # @apiSuccess {String} dataset Dataset name.
        # @apiSuccess {Int} start_time Signal start time.
        # @apiSuccess {Int} stop_time Signal stop time.
        # @apiSuccess {String} created_by User ID.
        # """

        res, status = verify_auth()
        if status == 401:
            return res, status
        document = schema.Signal.find_one(name=signal_name)

        if document is None:
            LOGGER.exception('Error getting signal. '
                             'Signal %s does not exist.', signal_name)
            return {
                'message': 'Signal {} does not exist'.format(signal_name)
            }, 400

        try:
            res = get_signal(document)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return res


class Signals(Resource):
    def get(self):
        """
        Return all signals
        ---
        responses:
          200:
            description: A list of colors (may be filtered by palette)
            schema:
              $ref: '#/definitions/Dataset'
            examples:
              rgb: ['red', 'green', 'blue']
        """
        # """
        # @api {get} /signals/ Get signals
        # @apiName GetSignals
        # @apiGroup Signal
        # @apiVersion 1.0.0

        # @apiSuccess {Object[]} signals Signal list.
        # @apiSuccess {String} signals.id Signal ID.
        # @apiSuccess {String} signals.insert_time Signal creation time.
        # @apiSuccess {String} signals.name Signal name.
        # @apiSuccess {String} signals.dataset Dataset name.
        # @apiSuccess {Int} signals.start_time Signal start time.
        # @apiSuccess {Int} signals.stop_time Signal stop time.
        # @apiSuccess {String} signals.created_by User ID.
        # """

        res, status = verify_auth()
        if status == 401:
            return res, status

        documents = schema.Signal.find()

        try:
            signals = [get_signal(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'signals': signals}


class SignalRaw(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('signal', type=str, required=True,
                                location='args')
        parser_get.add_argument('interval', type=int, required=True,
                                location='args')
        parser_get.add_argument('start_time', type=int, location='args')
        parser_get.add_argument('stop_time', type=int, location='args')
        self.parser_get = parser_get

    def _get_event_interaction(self, doc):
        annotation_id = None
        if doc.annotation is not None:
            annotation_id = str(doc.annotation.id)
        record = {
            'id': str(doc.id),
            'event': str(doc.event.id),
            'action': doc.action,
            'tag': doc.tag,
            'annotation': annotation_id,
            'start_time': doc.start_time,
            'stop_time': doc.stop_time,
            'insert_time': doc.insert_time.isoformat(),
            'created_by': doc.created_by
        }
        return record

    def get(self):
        """
        Find signal raw time series data by signal ID.
        ---
        responses:
          200:
            description: A list of colors (may be filtered by palette)
            schema:
              $ref: '#/definitions/Dataset'
            examples:
              rgb: ['red', 'green', 'blue']
        """
        # """
        # @api {get} /signalraw/ Get signal raw data
        # @apiName GetSignalRaw
        # @apiGroup Signal
        # @apiVersion 1.0.0

        # @apiParam {String} signal Signal ID.
        # @apiParam {Int} interval Interval (in seconds) and it will be used to
        #     aggregate the raw data.
        # @apiParam {Int} [start_time] Timestamp
        # @apiParam {Int} [stop_time] Timestamp

        # @apiSuccess {2-Tuple[]} data Data.
        # @apiSuccess {Int} data.timestamp Timestamp
        # @apiSuccess {Float} data.value Value
        # """

        res, status = verify_auth()
        if status == 401:
            return res, status

        try:
            args = self.parser_get.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            data = DBExplorer.get_raw(**args)
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 500
        else:
            return {'data': data}


class AvailableSignalruns(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('signalrun', type=str, required=True,
                                location='args')
        self.parser_get = parser_get

    def get(self):
        """
        Return all other available signalruns for the same signal
        ---
        responses:
          200:
            description: A list of colors (may be filtered by palette)
            schema:
              $ref: '#/definitions/Dataset'
            examples:
              rgb: ['red', 'green', 'blue']
        """
        # """
        # @api {get} /available_signalruns/ Get available signalruns for a signal
        # @apiName GetAvailableSignalruns
        # @apiGroup Signal
        # @apiVersion 1.0.0

        # @apiParam {String} signalrun Signalrun ID.

        # @apiSuccess {Object[]} data Data.
        # @apiSuccess {String} data.id Timestamp
        # @apiSuccess {Int} data.interval Interval used in this signalrun
        # """

        res, status = verify_auth()
        if status == 401:
            return res, status

        try:
            args = self.parser_get.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            current_signalrun_doc = schema.Signalrun.find_one(signalrun=args.signalrun)
            signalrun_docs = schema.Signalrun.find(signal=current_signalrun_doc.signal)

            data = list()
            interval_set = set()
            for signalrun_doc in signalrun_docs:
                primitive_name = 'orion.primitives.timeseries_preprocessing.time_segments_aggregate#1'
                pipeline = signalrun_doc.datarun.pipeline
                interval = int(pipeline.json['hyperparameters']
                               [primitive_name].get('interval', None))
                if interval is None:
                    raise Exception(
                        'signalrun - {}: interval = None'.format(str(signalrun_doc.id)))
                # this is HACK: only return one signalrun with the same interval
                if interval not in interval_set:
                    interval_set.add(interval)
                    item = {
                        'id': str(signalrun_doc.id),
                        'interval': interval
                    }
                    data.append(item)
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 500
        else:
            return {'data': data}
