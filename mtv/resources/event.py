import logging

from bson import ObjectId
from flask_restful import Resource, reqparse

from mtv.db import schema
from mtv.resources.auth_utils import requires_auth
from mtv.resources.datarun import validate_signalrun_id

LOGGER = logging.getLogger(__name__)


def get_event(event_doc):
    comments = list()
    comment_docs = schema.Annotation.find(event=event_doc.id)

    if comment_docs is not None:
        for comment_doc in comment_docs:
            comment = {
                'id': str(comment_doc.id),
                'text': comment_doc.comment,
                'insert_time': comment_doc.insert_time.isoformat(),
                'created_by': comment_doc.created_by
            }
            comments.append(comment)

    return {
        'id': str(event_doc.id),
        'insert_time': event_doc.insert_time.isoformat(),
        'start_time': event_doc.start_time,
        'stop_time': event_doc.stop_time,
        'score': event_doc.severity,
        'tag': event_doc.tag,
        'datarun': str(event_doc.signalrun.id),
        'source': event_doc.source,
        'comments': comments
    }


def validate_event_id(event_id):
    try:
        eid = ObjectId(event_id)
    except Exception as e:
        LOGGER.exception(e)
        return {'message': str(e)}, 400

    event_doc = schema.Event.find_one(id=eid)

    if event_doc is None:
        LOGGER.exception('Event %s does not exist.', event_id)
        return {
            'message': 'Event {} does not exist'.format(event_id)
        }, 400

    return event_doc, 200


class Event(Resource):

    def __init__(self):
        parser_put = reqparse.RequestParser(bundle_errors=True)
        parser_put.add_argument('start_time', type=int, required=True,
                                location='json')
        parser_put.add_argument('stop_time', type=int, required=True,
                                location='json')
        parser_put.add_argument('score', type=float, default=0, required=True,
                                location='json')
        parser_put.add_argument('created_by', type=str, default=None,
                                required=True, location='json')
        parser_put.add_argument('tag', type=str, default='Untagged',
                                required=False, location='json')
        self.parser_put = parser_put

        parser_delete = reqparse.RequestParser(bundle_errors=True)
        parser_delete.add_argument('created_by', type=str, default=None,
                                   required=True, location='args')
        self.parser_delete = parser_delete

    @requires_auth
    def get(self, event_id):
        """
        Get an event by ID
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        parameters:
          - name: event_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the event to get
        responses:
          200:
            description: Event to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Event'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        # validate event_id
        validate_result = validate_event_id(event_id)
        if validate_result[1] == 400:
            return validate_result

        event_doc = validate_result[0]

        # return result
        try:
            res = get_event(event_doc)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
        else:
            return res

    @requires_auth
    def put(self, event_id):
        """
        Update an event
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        parameters:
          - name: event_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the event to update
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  start_time:
                    type: integer
                  stop_time:
                    type: integer
                  score:
                    type: integer
                  tag:
                    type: string
                required: ['start_time', 'stop_time', 'score']
        responses:
          200:
            description: Event after updating
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Event'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        # validate event_id
        validate_result = validate_event_id(event_id)
        if validate_result[1] == 400:
            return validate_result

        event_doc = validate_result[0]

        try:
            args = self.parser_put.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        # update event
        action_modify = False
        if (args['start_time'] != event_doc.start_time
                or args['stop_time'] != event_doc.stop_time):
            action_modify = True
        event_doc.start_time = args['start_time']
        event_doc.stop_time = args['stop_time']
        event_doc.score = args['score']

        action_tag = False
        if args['tag'] != 'Untagged' and args['tag'] != 'None':
            if (args['tag'] != event_doc.tag):
                action_tag = True
            event_doc.tag = args['tag']

        # return result
        try:
            event_doc.save()
            user = args['created_by']
            if action_modify:
                doc = {
                    'event': event_doc.id,
                    'action': 'MODIFY',
                    'start_time': event_doc.start_time,
                    'stop_time': event_doc.stop_time,
                    'created_by': user
                }
                schema.EventInteraction.insert(**doc)
            if action_tag:
                doc = {
                    'event': event_doc.id,
                    'action': 'TAG',
                    'tag': event_doc.tag,
                    'created_by': user
                }
                schema.EventInteraction.insert(**doc)
            res = get_event(event_doc)
        except Exception as e:
            LOGGER.exception('Error saving event. ' + str(e))
            return {'message': str(e), 'code': 500}, 500
        else:
            return res

    @requires_auth
    def delete(self, event_id):
        """
        Delete an event
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        parameters:
          - name: event_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the event to get
        responses:
          200:
            description: Event to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Event'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        # validate event_id
        validate_result = validate_event_id(event_id)
        if validate_result[1] == 400:
            return validate_result
        event_doc = validate_result[0]

        try:
            args = self.parser_delete.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            event_doc.delete()
            doc = {
                'event': event_doc.id,
                'action': 'DELETE',
                'created_by': args['created_by']
            }
            schema.EventInteraction.insert(**doc)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500


class Events(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('datarun_id', type=str, required=False,
                                location='json')
        self.parser_get = parser_get

        parser_post = reqparse.RequestParser(bundle_errors=True)
        parser_post.add_argument('start_time', type=str, required=True,
                                 location='json')
        parser_post.add_argument('stop_time', type=str, required=True,
                                 location='json')
        parser_post.add_argument('datarun_id', type=str, required=True,
                                 location='json')
        parser_post.add_argument('created_by', type=str, required=True,
                                 location='json')
        parser_post.add_argument('source', type=str, default='MANUALLY_CREATED',
                                 location='json')
        parser_post.add_argument('score', type=float, default=0,
                                 location='json')
        parser_post.add_argument('tag', type=str, default=None,
                                 location='json')
        self.parser_post = parser_post

    def get(self):
        """
        Return all events of a given signalrun
        If signalrun is not given, it will return all events.
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        parameters:
          - name: datarun_id
            in: query
            schema:
              type: string
            required: true
            description: ID of the signalrun to filter events (We will \
            update the name to signalrun)
        responses:
          200:
            description: A list of events of the specified signalrun
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    events:
                      type: array
                      items:
                        $ref: '#/components/schemas/Event'
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
            return {'message': str(e)}, 400

        datarun_id = args['datarun_id']
        query = dict()

        # validate datarun_id
        if datarun_id is not None and datarun_id != '':
            validate_result = validate_signalrun_id(datarun_id)
            if validate_result[1] == 400:
                return validate_result

            datarun_doc = validate_result[0]
            query['signalrun'] = datarun_doc.id

        event_docs = schema.Event.find(**query).order_by('+start_time')
        if event_docs is None:
            return []

        try:
            events = [get_event(event_doc) for event_doc in event_docs]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
        else:
            return {'events': events}

    @requires_auth
    def post(self):
        """
        Create an event
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  start_time:
                    type: integer
                  stop_time:
                    type: integer
                  score:
                    type: integer
                  datarun_id:
                    type: string
                    description: This is signalrun_id in fact (
                        to be fixed later).
                  created_by:
                    type: string
                  tag:
                    type: string
                  source:
                    type: string
                    enum: ["SHAPE_MATCHING", "MANUALLY_CREATED", "ORION"]
                required: ['start_time', 'stop_time', 'datarun_id',
                    'created_by']
        responses:
          200:
            description: The newly created Event
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Event'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        try:
            args = self.parser_post.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        # further validate datarun
        validate_result = validate_signalrun_id(args['datarun_id'])
        if validate_result[1] == 400:
            return validate_result

        # create and return event
        try:
            doc = {
                key: args[key]
                for key in ['start_time', 'stop_time', 'tag', 'source']
                if args[key] is not None
            }
            doc['signalrun'] = args['datarun_id']
            doc['severity'] = args['score']

            signalrun_doc = schema.Signalrun.find_one(
                signalrun=args['datarun_id'])
            doc['signal'] = str(signalrun_doc.signal.id)

            event_doc = schema.Event.insert(**doc)

            doc = {
                'event': event_doc.id,
                'action': 'CREATE',
                'start_time': event_doc.start_time,
                'stop_time': event_doc.stop_time,
                'created_by': args['created_by']
            }
            schema.EventInteraction.insert(**doc)

            if event_doc.tag is not None:
                doc = {
                    'event': event_doc.id,
                    'action': 'TAG',
                    'tag': event_doc.tag,
                    'created_by': args['created_by']
                }
                schema.EventInteraction.insert(**doc)

            res = get_event(event_doc)
        except Exception as e:
            LOGGER.exception('Error creating event. ' + str(e))
            return {'message': str(e), 'code': 500}, 500
        else:
            return res


class EventInteraction(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('event_id', type=str, required=True,
                                location='args')
        parser_get.add_argument('action', location='args',
                                choices=['DELETE', 'CREATE', 'MODIFY',
                                         'TAG', 'COMMENT'])
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

    @requires_auth
    def get(self):
        """
        Get event interaction history by Event ID
        ---
        tags:
          - event
        security:
          - tokenAuth: []
        parameters:
          - name: event_id
            in: query
            schema:
              type: string
            required: true
            description: ID of the event to filter interactions
          - name: action
            in: query
            schema:
              type: string
            required: false
            description: action type to filter interactions
        responses:
          200:
            description: A list of interactions of the specified event
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    records:
                      type: array
                      items:
                        $ref: '#/components/schemas/EventInteraction'
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
            return {'message': str(e), 'code': 400}, 400

        validate_result = validate_event_id(args['event_id'])
        if validate_result[1] == 400:
            return validate_result

        query = {
            'event': ObjectId(args['event_id'])
        }
        if args.action is not None:
            query['action'] = args.action
        docs = schema.EventInteraction.find(**query)
        try:
            records = [self._get_event_interaction(doc) for doc in docs]
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 500}, 500
        else:
            return {'records': records}
