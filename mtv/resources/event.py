import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv.db import schema
from mtv.resources.auth_utils import verify_auth
from mtv.resources.datarun import validate_datarun_id

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

    def get(self, event_id):
        """
        @api {get} /events/:event_id/ Get event by ID
        @apiName GetEvent
        @apiGroup Event
        @apiVersion 1.0.0

        @apiParam {String} event_id Event ID.

        @apiSuccess {String} id Event ID.
        @apiSuccess {String} insert_time Event insert time.
        @apiSuccess {String} datarun The belonged datarun.
        @apiSuccess {String} tag Event tag.
        @apiSuccess {Int} start_time Event start time.
        @apiSuccess {Int} stop_time Event stop time.
        @apiSuccess {Float} score Event anomaly score.
        @apiSuccess {Object[]} comments Event comment list.
        @apiSuccess {String} comments.id Comment ID.
        @apiSuccess {String} comments.text Comment content.
        @apiSuccess {String} comments.insert_time Comment creation time.
        @apiSuccess {String} comments.created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
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
            return {'message': str(e)}, 500
        else:
            return res

    def put(self, event_id):
        """
        @api {put} /events/:event_id/ Update an event
        @apiName UpdateEvent
        @apiGroup Event
        @apiVersion 1.0.0

        @apiParam {String} event_id Event ID.
        @apiParam {Int} start_time Event start time.
        @apiParam {Int} stop_time Event stop time.
        @apiParam {Float} score Event anomaly score.
        @apiParam {String} tag Event tag.

        @apiSuccess {String} id Event ID.
        @apiSuccess {String} insert_time Event insert time.
        @apiSuccess {String} datarun The belonged datarun.
        @apiSuccess {String} tag Event tag.
        @apiSuccess {Int} start_time Event start time.
        @apiSuccess {Int} stop_time Event stop time.
        @apiSuccess {Float} score Event anomaly score.
        @apiSuccess {Object[]} comments Event comment list.
        @apiSuccess {String} comments.id Comment ID.
        @apiSuccess {String} comments.text Comment content.
        @apiSuccess {String} comments.insert_time Comment creation time.
        @apiSuccess {String} comments.created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        # validate event_id
        validate_result = validate_event_id(event_id)
        if validate_result[1] == 400:
            return validate_result

        event_doc = validate_result[0]

        # modifiable attributes
        attrs = ['start_time', 'stop_time', 'score', 'tag']
        attrs_type = [float, float, float, str]
        d = dict()
        body = request.json
        for attr in attrs:
            d[attr] = None
            if body is not None:
                d[attr] = body.get(attr)
            else:
                if attr in request.form:
                    d[attr] = request.form[attr]
        # validate data type
        try:
            for i, attr in enumerate(attrs):
                d[attr] = attrs_type[i](d[attr])
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        # update event
        event_doc.start_time = d['start_time']
        event_doc.stop_time = d['stop_time']
        event_doc.score = d['score']
        if d['tag'] != 'untagged':
            event_doc.tag = d['tag']

        # return result
        try:
            event_doc.save()
            res = get_event(event_doc)
        except Exception as e:
            LOGGER.exception('Error saving event. ' + str(e))
            return {'message': str(e)}, 400
        else:
            return res

    def delete(self, event_id):
        """
        @api {delete} /events/:event_id/ Delete an event
        @apiName DeleteEvent
        @apiGroup Event
        @apiVersion 1.0.0

        @apiParam {String} event_id Event ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status

        # validate event_id
        validate_result = validate_event_id(event_id)
        if validate_result[1] == 400:
            return validate_result

        event_doc = validate_result[0]

        try:
            event_doc.delete()
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 500


class Events(Resource):
    def get(self):
        """
        @api {get} /events/ Get events by datarun ID
        @apiName GetEventByDatarun
        @apiGroup Event
        @apiVersion 1.0.0
        @apiDescription Return event list of a given datarun. If the datarun is not
        specified, return all events.

        @apiParam {String} datarun_id Datarun ID.

        @apiSuccess {String} events Event list.
        @apiSuccess {String} events.id Event ID.
        @apiSuccess {String} events.insert_time Event insert time.
        @apiSuccess {String} events.datarun The belonged datarun.
        @apiSuccess {String} events.tag Event tag.
        @apiSuccess {Int} events.start_time Event start time.
        @apiSuccess {Int} events.stop_time Event stop time.
        @apiSuccess {Float} events.score Event anomaly score.
        @apiSuccess {Object[]} events.comments Event comment list.
        @apiSuccess {String} events.comments.id Comment ID.
        @apiSuccess {String} events.comments.text Comment content.
        @apiSuccess {String} events.comments.insert_time Comment creation time.
        @apiSuccess {String} events.comments.created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        datarun_id = request.args.get('datarun_id', None)
        query = dict()

        # validate datarun_id
        if datarun_id is not None and datarun_id != '':
            validate_result = validate_datarun_id(datarun_id)
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
            return {'message': str(e)}, 500
        else:
            return {'events': events}

    def post(self):
        """
        @api {post} /events/ Create an event
        @apiName CreateEvent
        @apiGroup Event
        @apiVersion 1.0.0

        @apiParam {Int} start_time Event start time.
        @apiParam {Int} stop_time Event stop time.
        @apiParam {Float} score Event anomaly score.
        @apiParam {String} tag Event tag.
        @apiParam {String} datarun_id Datarun ID.

        @apiSuccess {String} id Event ID.
        @apiSuccess {String} insert_time Event insert time.
        @apiSuccess {String} datarun The belonged datarun.
        @apiSuccess {String} tag Event tag.
        @apiSuccess {Int} start_time Event start time.
        @apiSuccess {Int} stop_time Event stop time.
        @apiSuccess {Float} score Event anomaly score.
        @apiSuccess {Object[]} comments Event comment list.
        @apiSuccess {String} comments.id Comment ID.
        @apiSuccess {String} comments.text Comment content.
        @apiSuccess {String} comments.insert_time Comment creation time.
        @apiSuccess {String} comments.created_by User ID.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        # modifiable attributes
        attrs = ['start_time', 'stop_time', 'score', 'tag', 'datarun_id']
        attrs_type = [float, float, float, str, str]
        d = dict()
        body = request.json
        for attr in attrs:
            d[attr] = None
            if body is not None:
                d[attr] = body.get(attr)
            else:
                if attr in request.form:
                    d[attr] = request.form[attr]

        # validate data type
        try:
            for i, attr in enumerate(attrs):
                d[attr] = attrs_type[i](d[attr])
        except Exception as e:
            LOGGER.exception(e)
            return {'message': str(e)}, 400

        # further validate datarun
        validate_result = validate_datarun_id(d['datarun_id'])
        if validate_result[1] == 400:
            return validate_result

        validate_result[0]

        # create and return event
        try:
            d['signalrun'] = d['datarun_id']
            del d['datarun_id']
            if d['tag'] == 'untagged':
                del d['tag']
            d['severity'] = d['score']
            del d['score']
            d['source'] = 'MANUALLY_CREATED'
            event_doc = schema.Event.insert(**d)
            res = get_event(event_doc)
        except Exception as e:
            LOGGER.exception('Error creating event. ' + str(e))
            return {'message': str(e)}, 400
        else:
            return res
