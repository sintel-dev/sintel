import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Comment(Resource):
    """ Shows a single comment item and lets you delete or
        update a comment item
    """

    def get(self, event):
        """GET /api/v1/comments/<event:string>/"""

        query = {
            "event": ObjectId(event)
        }

        document = model.Comment.find_one(**query)

        return {
            "id": str(document.id),
            "event": event,
            "text": document.text,
            "created_by": document.created_by
        }

    def put(self, comment):
        """PUT /api/v1/comments/<comment:string>/"""
        body = request.json
        event = body.get('event', None)
        text = body.get('text', None)
        created_by = body.get('created_by', 'default')

        if (event is None or text is None):
            LOGGER.exception('Error updating the comment. Incomplete information')
            raise ValueError

        document = model.Comment.find_one(id=ObjectId(comment))
        document.text = text
        document.created_by = created_by

        document.save()
        return str(document.id)

    def delete(comment):
        pass


class Comments(Resource):
    def get(self):
        """ Return comment list of a given datarun. If the datarun is not
            specified, return all events.

        GET /api/v1/comments/event?=xxx
        """

        event = request.args.get('event', None)

        if (event is None):
            LOGGER.exception('Error getting comments. Event is not specified!')

        query = {
            "event": ObjectId(event)
        }

        document = model.Comment.find_one(**query)

        if (document is None):
            return {
                "id": 'new'
            }

        return {
            "id": str(document.id),
            "event": event,
            "text": document.text,
            "created_by": document.created_by
        }

    def post(self):
        """ Create a comment.

        POST /api/v1/events/
        """

        body = request.json
        e = {
            'event': body.get('event', None),
            'text': body.get('text', None),
            'created_by': body.get('created_by', 'default')
        }

        if (e['event'] is None or e['text'] is None):
            LOGGER.exception('incorrect event information creating new comment')
            raise ValueError

        document = model.Comment.insert(**e)
        return str(document.id)
