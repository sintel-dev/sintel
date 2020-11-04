import logging

from bson import ObjectId
from flask_restful import Resource, reqparse

from sintel.db import schema
from sintel.resources.auth_utils import requires_auth

LOGGER = logging.getLogger(__name__)


def get_annotation(anno_doc):
    return {
        'id': str(anno_doc.id),
        'event': anno_doc.event.id,
        'text': anno_doc.comment,
        'created_by': anno_doc.created_by
    }


class Comment(Resource):

    def __init__(self):
        parser_put = reqparse.RequestParser(bundle_errors=True)
        parser_put.add_argument('text', type=str, required=True,
                                location='json')
        self.parser_put = parser_put

        parser_delete = reqparse.RequestParser(bundle_errors=True)
        parser_delete.add_argument('created_by', type=str, default=None,
                                   required=True, location='args')
        self.parser_delete = parser_delete

    @requires_auth
    def get(self, comment_id):
        """
        Get an annotation (comment) by ID
        ---
        tags:
          - annotation
        security:
          - tokenAuth: []
        parameters:
          - name: comment_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the annotation (comment) to get
        responses:
          200:
            description: Annotation to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Annotation'
        """

        try:
            cid = ObjectId(comment_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 400}, 400

        document = schema.Annotation.find_one(id=cid)

        if document is None:
            message = 'Comment {} does not exist'.format(comment_id)
            LOGGER.exception(message)
            return {
                'message': message,
                'code': 400
            }, 400

        return get_annotation(document)

    @requires_auth
    def put(self, comment_id):
        """
        Update an annotation (comment)
        ---
        tags:
          - annotation
        security:
          - tokenAuth: []
        parameters:
          - name: comment_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the comment to update
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  text:
                    type: string
                required: ['text']
        responses:
          200:
            description: Annotation (Comment) after updating
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Annotation'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        try:
            args = self.parser_put.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        text = args['text']

        # get data from db
        try:
            cid = ObjectId(comment_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 400}, 400

        document = schema.Annotation.find_one(id=cid)
        if document is None:
            LOGGER.exception('Error updating the comment. '
                             'Comment %s does not exist.', comment_id)
            return {
                'message': 'Comment {} does not exist'.format(comment_id)
            }, 400
        else:
            try:
                document.comment = text
                document.save()
                # TODO: update event interactions
                return get_annotation(document)
            except Exception as e:
                LOGGER.exception(e)
                return {'message': str(e)}, 500

    @requires_auth
    def delete(self, comment_id):
        """
        Delete an comment
        ---
        tags:
          - annotation
        security:
          - tokenAuth: []
        parameters:
          - name: comment_id
            in: path
            schema:
              type: string
            required: true
            description: ID of the comment to get
        responses:
          200:
            description: Event to be returned
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Annotation'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """
        # TODO: to be updated


class Comments(Resource):

    def __init__(self):
        parser_get = reqparse.RequestParser(bundle_errors=True)
        parser_get.add_argument('event_id', type=str, required=True,
                                location='args')
        self.parser_get = parser_get

        parser_post = reqparse.RequestParser(bundle_errors=True)
        parser_post.add_argument('event_id', type=str, required=True,
                                 location='json')
        parser_post.add_argument('created_by', type=str, default="default",
                                 required=True, location='json')
        parser_post.add_argument('text', type=str, required=True,
                                 location='json')
        self.parser_post = parser_post

    @requires_auth
    def get(self):
        """
        Return all annotations (comment) of a given event (id)
        ---
        tags:
          - annotation
        security:
          - tokenAuth: []
        parameters:
          - name: event_id
            in: query
            schema:
              type: string
            required: true
            description: ID of the event to filter annotations
        responses:
          200:
            description: A list of annotations of the given event
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    comments:
                      type: array
                      items:
                        $ref: '#/components/schemas/Annotation'
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
        # get values from request args
        event_id = args['event_id']

        # validate
        if (event_id is None):
            LOGGER.exception('Error getting comments. Event is not specified.')
            return {'message': 'Event is not specified.', 'code': 400}, 400

        try:
            eid = ObjectId(event_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 400}, 400

        documents = schema.Annotation.find(event=eid)

        comments = []
        for document in documents:
            comments.append({
                "id": str(document.id),
                "event": event_id,
                "text": document.comment,
                "created_by": document.created_by,
                "insert_time": str(document.insert_time)
            })

        return {'comments': comments}

    @requires_auth
    def post(self):
        """
        Create an Annotation (Comment)
        ---
        tags:
          - annotation
        security:
          - tokenAuth: []
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  event_id:
                    type: string
                  text:
                    type: string
                  created_by:
                    type: string
                required: ['event_id', 'text', 'created_by']
        responses:
          200:
            description: The newly created Annotation
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Annotation'
          400:
            $ref: '#/components/responses/ErrorMessage'
          401:
            $ref: '#/components/responses/UnauthorizedError'
          500:
            $ref: '#/components/responses/ErrorMessage'
        """

        event_id = None
        text = None
        created_by = 'default'

        try:
            args = self.parser_get.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message': str(e), 'code': 400}, 400

        event_id, text, created_by = [
            args[k] for k in ['event_id', 'text', 'created_by']
        ]

        if (event_id is None) or (text is None) or (event_id == ''):
            message = 'Event_id or text is not specified.'
            LOGGER.exception(message)
            return {'message': message, 'code': 400}, 400

        try:
            eid = ObjectId(event_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e), 'code': 400}, 400

        target_event = schema.Event.find_one(id=eid)
        if target_event is None:
            LOGGER.exception('Error creating comments.'
                             'Event {} does not exist.'.format(event_id))
            return {'message': 'Event {} does not exist.'.format(event_id)}, 400

        comment = {
            'event': eid,
            'comment': text,
            'created_by': created_by
        }

        try:
            annotation_doc = schema.Annotation.insert(**comment)

            doc = {
                'event': target_event.id,
                'action': 'COMMENT',
                'annotation': annotation_doc.id,
                'created_by': created_by
            }
            schema.EventInteraction.insert(**doc)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
