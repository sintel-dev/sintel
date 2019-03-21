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
    def get(comment):
        pass

    def put(comment):
        body = request.json
        event = body.get('event', None)
        text = body.get('text', None)
        created_by = body.get('created_by', None)

        if (event is None or text is None or created_by is None):
            LOGGER.exception('incorrect event information updating an event')
            raise ValueError

        document = model.Event.find_one(id=ObjectId(event))
        document.text = text
        document.created_by = created_by

        document.save()
        return document.id

    def delete(comment):
        pass


class CommentList(Resource):
    """ Shows a list of comments and lets you add a new comment item"""
    def get():
        pass

    def post():
        body = request.json
        e = {
            "event": body.get('event', None),
            "text": body.get('stop_time', None),
            "created_by": body.get('created_by', None)
        }

        if (e['event'] is None or e['text']
                is None or e['created_by'] is None):
            LOGGER.exception(
                'incorrect event information creating new comment')
            raise ValueError

        document = model.Comment.insert(**e)
        return str(document.id)
