import logging

from bson import ObjectId
from flask_restful import Resource, reqparse

from sintel.db import DBExplorer, schema
from sintel.resources.auth_utils import requires_auth
from sintel.resources.computing.utils.layout import tsne
from sintel.resources.experiment import validate_experiment_id

LOGGER = logging.getLogger(__name__)


def get_signalrun(signalrun_doc):

    primitive_name = ('mlprimitives.custom.timeseries_preprocessing'
                      '.time_segments_aggregate#1')
    pipeline = signalrun_doc.datarun.pipeline
    interval = int(pipeline.json['hyperparameters']
                   [primitive_name].get('interval', None))

    signalrun = {
        'id': str(signalrun_doc.id),
        'signalrun_id': str(signalrun_doc.id),
        'interval': interval,
        'experiment': str(signalrun_doc.datarun.experiment.id),
        'signal': signalrun_doc.signal.name,
        'signal_id': str(signalrun_doc.signal.id),
        'start_time': signalrun_doc.start_time.isoformat(),
        'end_time': signalrun_doc.end_time.isoformat(),
        'status': signalrun_doc.status,
        'events': [],
        'prediction': None,
        'raw': [],
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
    """Extract signalruns out of a datarun.

    The order in the returned list matters. TSNE is applied to put
    similar signalruns as close as possible.

    Args:
        datarun_doc (mongoengine.Document):
            datarun document.

    Returns:
        list:
            List of Signalruns.
    """
    signalruns = list()
    signalrun_docs = schema.Signalrun.find(datarun=datarun_doc.id)
    for signalrun_doc in signalrun_docs:
        signalrun = get_signalrun(signalrun_doc)
        signalruns.append(signalrun)

    # TODO: add layout option
    if len(signalruns) > 1:
        signalruns = tsne(signalruns)
    return signalruns


def validate_signalrun_id(signalrun_id):
    try:
        did = ObjectId(signalrun_id)
    except Exception as e:
        LOGGER.exception(e)
        return {'message': str(e)}, 400

    signalrun_doc = schema.Signalrun.find_one(id=did)

    if signalrun_doc is None:
        message = 'Signalrun {} does not exist'.format(signalrun_id)
        LOGGER.exception(message)
        return {
            'message': message,
            'code': 400
        }, 400

    return signalrun_doc, 200


class Datarun(Resource):

    @requires_auth
    def get(self, datarun_id):
        """
        Get a Signalrun by ID
        This API fetch signalrun instead of datarun. We will change it \
        to correct name soon.

        Note that the returned data size could be very large.
        ---
        tags:
          - signalrun
        security:
          - tokenAuth: []
        parameters:
          - name: datarun_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the Signalrun
        responses:
          200:
            description: Signalrun to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Signalrun'
          400:
            $ref: '#/components/responses/ErrorMessage'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        # validate datarun_id
        validate_result = validate_signalrun_id(datarun_id)
        if validate_result[1] == 400:
            return validate_result

        signalrun_doc = validate_result[0]

        # return result
        try:
            res = get_signalrun(signalrun_doc)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
        else:
            return res


class Dataruns(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('experiment_id', type=str, default=None,
                                location='args')
        self.parser_get = parser_get

    @requires_auth
    def get(self):
        """
        Return all Signalrun(s) by experiment ID
        If the experiment ID is not given, it will return all signalruns.

        Note that the returned data size could be very large.
        ---
        tags:
          - signalrun
        security:
          - tokenAuth: []
        parameters:
          - name: experiment_id
            in: query
            schema:
              type: string
            required: true
            description: ID of the Experiment to filter signalruns
        responses:
          200:
            description: A list of Signalruns to be returned
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    dataruns:
                      type: array
                      items:
                        $ref: '#/components/schemas/Signalrun'
                      description: should be named as signalruns later
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        try:
            args = self.parser_get.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        experiment_id = args['experiment_id']

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
