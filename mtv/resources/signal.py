import logging

from flask_restful import Resource

from mtv import model

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

        document = model.Signal.find_one(name=signal_name)

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

        documents = model.Signal.find()

        if documents is None:
            return []

        try:
            signals = [get_signal(document) for document in documents]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return {'signals': signals}
