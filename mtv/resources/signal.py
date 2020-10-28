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
        Get a signal by name
        ---
        tags:
          - signal
        parameters:
          - name: signal_name
            in: path
            schema:
              type: string
            required: true
            description: name of the signal to get
        responses:
          200:
            description: Signal to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Signal'
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
        Return all signals
        ---
        tags:
          - signal
        responses:
          200:
            description: All signals
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    signals:
                      type: array
                      items:
                        $ref: '#/components/schemas/Signal'
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
        Get signal raw time series data by ID.
        ---
        tags:
            - signal
        parameters:
          - name: signal
            in: query
            required: true
            schema:
              type: string
            description: ID of the signal to fetch
          - name: interval
            in: query
            required: true
            schema:
              type: string
            description: Interval used to aggregate raw time series; by default
                         21600 is used
          - name: start_time
            in: query
            schema:
              type: integer
            description: start time (timestamp) of the fetched segment
          - name: stop_time
            in: query
            schema:
              type: integer
            description: stop time (timestamp) of the fetched segment
        responses:
          200:
            description: All signals
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    data:
                      type: array
                      items:
                        type: array
                        items:
                          type: integer
                          minitems: 2
                          maxitems: 2
                      description: '[timestamp, value]'
                example:
                  data: [[1420070400, 12], [1420090400, 18]]
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


class AvailableSignalruns(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('signalrun', type=str, required=True,
                                location='args')
        self.parser_get = parser_get

    def get(self):
        """
        Return the available signalruns for the same signal
        Given a signalrun, return all of the available signalruns \
        that run on the same signal
        ---
        tags:
            - signalrun
        parameters:
          - name: signalrun
            in: query
            required: true
            schema:
              type: string
            description: ID of the signalrun
        responses:
          200:
            description: List of available signalruns' meta info
            content:
              application/json:
                schema:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                        description: signalrun ID
                      interval:
                        type: integer
                        description: interval used in this signalrun
                example:
                  data:
                    - id: 5f5b0b40013e4f912fba3363
                      interval: 21600
                    - id: 5f5b0cbb013e4f912fba33ae
                      interval: 3600
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
            current_signalrun_doc = schema.Signalrun.find_one(
                signalrun=args.signalrun)
            signalrun_docs = schema.Signalrun.find(
                signal=current_signalrun_doc.signal)

            data = list()
            interval_set = set()
            for signalrun_doc in signalrun_docs:
                primitive_name = ('orion.primitives.timeseries_preprocessing'
                                  '.time_segments_aggregate#1')
                pipeline = signalrun_doc.datarun.pipeline
                interval = int(pipeline.json['hyperparameters']
                               [primitive_name].get('interval', None))
                if interval is None:
                    raise Exception(
                        'signalrun - {}: interval = None'.format(
                            str(signalrun_doc.id)))
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
