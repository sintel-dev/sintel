import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


class Comment(Resource):
    def get(self, comment_id):
        """
        @api {get} /comments/:comment_id/ Get comment by ID
        @apiName GetComment
        @apiGroup Comment
        @apiVersion 1.0.0

        @apiParam {String} comment_id Comment ID.

        @apiSuccess {String} id Comment ID.
        @apiSuccess {String} event Event ID.
        @apiSuccess {String} text Comment content.
        @apiSuccess {String} created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status

        try:
            cid = ObjectId(comment_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        document = model.Comment.find_one(id=cid)

        if document is None:
            LOGGER.exception('Error getting comment. '
                             'Comment %s does not exist.', comment_id)
            return {
                'message': 'Comment {} does not exist'.format(comment_id)
            }, 400

        return {
            "id": str(document.id),
            "event": str(document.event.id),
            "text": document.text,
            "created_by": document.created_by
        }

    def put(self, comment_id):
        """
        @api {put} /comments/:comment_id/ Update a comment
        @apiName UpdateComment
        @apiGroup Comment
        @apiVersion 1.0.0

        @apiParam {String} comment_id Comment ID.
        @apiParam {String} text Comment content.

        @apiSuccess {String} id Comment ID.
        @apiSuccess {String} event Event ID.
        @apiSuccess {String} text Comment content.
        @apiSuccess {String} created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status

        # get values from body or form
        text = None

        body = request.json
        if body is not None:
            text = body.get('text')
        else:
            if 'text' in request.form:
                text = request.form['text']

        # validate
        # if text is None or text == '':
        #     LOGGER.exception('Error updating comment. Lack of comment content.')
        #     return {'message': 'Lack of comment content.'}, 400

        # get data from db
        try:
            cid = ObjectId(comment_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        document = model.Comment.find_one(id=cid)
        if document is None:
            LOGGER.exception('Error updating the comment. '
                             'Comment %s does not exist.', comment_id)
            return {
                'message': 'Comment {} does not exist'.format(comment_id)
            }, 400
        else:
            try:
                document.text = text
                document.save()
                return {
                    "id": str(document.id),
                    "event": str(document.event.id),
                    "text": document.text,
                    "created_by": document.created_by
                }
            except Exception as e:
                LOGGER.exception(e)
                return {'message': str(e)}, 400


class Comments(Resource):
    def get(self):
        """
        @api {get} /comments/ Get comments by event ID
        @apiName GetCommentByEvent
        @apiGroup Comment
        @apiVersion 1.0.0
        @apiDescription Each event can have multiple comments, from one or more users.
        This api allows users to retrieve all the comments about one event.

        @apiParam {String} event_id ID of event.

        @apiSuccess {Object[]} comments An Array of Object Comment.
        @apiSuccess {String} comments.id Comment ID.
        @apiSuccess {String} comments.event Event ID.
        @apiSuccess {String} comments.text Comment content.
        @apiSuccess {String} comments.created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        # get values from request args
        event_id = request.args.get('event_id', None)

        # validate
        if (event_id is None):
            LOGGER.exception('Error getting comments. Event is not specified.')
            return {'message': 'Event is not specified.'}, 400

        try:
            eid = ObjectId(event_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        documents = model.Comment.find(event=eid)

        comments = []
        for document in documents:
            comments.append({
                "id": str(document.id),
                "event": event_id,
                "text": document.text,
                "created_by": document.created_by
            })

        return {'comments': comments}

    def post(self):
        """
        @api {post} /comments/ Create a comment
        @apiName CreateComment
        @apiGroup Comment
        @apiVersion 1.0.0

        @apiParam {String} event_id Event ID.
        @apiParam {String} text Content of comment.
        @apiParam {String} [created_by='default'] User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status

        event_id = None
        text = None
        created_by = 'default'

        body = request.json
        if body is not None:
            event_id = body.get('event_id')
            text = body.get('text')
            created_by = body.get('created_by')
        else:
            if 'event_id' in request.form:
                event_id = request.form['event_id']
            if 'text' in request.form:
                text = request.form['text']
            if 'created_by' in request.form:
                created_by = request.form['created_by']

        if (event_id is None) or (text is None) or (event_id == ''):
            LOGGER.exception('Error creating comments. Event_id or text is not specified.')
            return {'message': 'Event_id or text is not specified.'}, 400

        try:
            eid = ObjectId(event_id)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        target_event = model.Event.find_one(id=eid)
        if target_event is None:
            LOGGER.exception('Error creating comments.'
                             'Event {} does not exist.'.format(event_id))
            return {'message': 'Event {} does not exist.'.format(event_id)}, 400

        comment = {
            'event': eid,
            'text': text,
            'created_by': created_by
        }

        try:
            model.Comment.insert(**comment)
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500
