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
        @api {get} /signals/:signal_name/ Get signal by name
        @apiName GetSignal
        @apiGroup Signal
        @apiVersion 1.0.0

        @apiParam {String} signal_name Signal name.

        @apiSuccess {String} id Signal ID.
        @apiSuccess {String} insert_time Signal creation time.
        @apiSuccess {String} name Signal name.
        @apiSuccess {String} dataset Dataset name.
        @apiSuccess {Int} start_time Signal start time.
        @apiSuccess {Int} stop_time Signal stop time.
        @apiSuccess {String} created_by User ID.
        """

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
        @api {get} /signals/ Get signals
        @apiName GetSignals
        @apiGroup Signal
        @apiVersion 1.0.0


        @apiSuccess {Object[]} signals Signal list.
        @apiSuccess {String} signals.id Signal ID.
        @apiSuccess {String} signals.insert_time Signal creation time.
        @apiSuccess {String} signals.name Signal name.
        @apiSuccess {String} signals.dataset Dataset name.
        @apiSuccess {Int} signals.start_time Signal start time.
        @apiSuccess {Int} signals.stop_time Signal stop time.
        @apiSuccess {String} signals.created_by User ID.
        """

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
        @api {get} /signalraw/ Get signal raw data
        @apiName GetSignalRaw
        @apiGroup Signal
        @apiVersion 1.0.0

        @apiParam {String} signal Signal ID.
        @apiParam {Int} interval Interval (in seconds) and it will be used to
            aggregate the raw data.
        @apiParam {Int} [start_time] Timestamp
        @apiParam {Int} [stop_time] Timestamp

        @apiSuccess {2-Tuple[]} data Data.
        @apiSuccess {Int} data.timestamp Timestamp
        @apiSuccess {Float} data.value Value
        """

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
