import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Event(Resource):
    """ Shows a single event item and lets you delete or update a event item"""
    def get(event):
        """  GET /api/v1/events/<string:event>/ """
        document = model.Event.find_one(id=ObjectId(event))

        return ({
                'start_time': document.start_time,
                'stop_time': document.stop_time,
                'score': document.score,
                'id': str(document.id),
                })

    def put(event):
        """  GET /api/v1/events/<string:event>/ """
        document = model.Event.find_one(id=ObjectId(event))

        body = request.json
        start_time = body.get('start_time', None)
        stop_time = body.get('stop_time', None)
        score = body.get('score', None)

        if (start_time is None or stop_time is None or score is None):
            LOGGER.exception('incorrect event information updating an event')
            raise ValueError

        document.start_time = start_time
        document.stop_time = stop_time
        document.score = score

        document.save()
        return event

    def delete(event_id):
        pass


class EventList(Resource):
    """ Shows a list of events and lets you add a new event item"""

    def post():
        body = request.json
        e = {
            "start_time": body.get('start_time', None),
            "stop_time": body.get('stop_time', None),
            "score": body.get('score', None),
            "datarun": body.get('datarun', None)
        }

        if (e['start_time'] is None or e['stop_time'] is None
                or e['score'] is None or e['datarun'] is None):
            LOGGER.exception('incorrect event information creating new event')
            raise ValueError

        e['datarun'] = ObjectId(e['datarun'])
        document = model.Event.insert(**e)
        return str(document.id)
