import logging

import numpy as np
import pandas as pd
from flask_restful import Resource, reqparse
from sklearn.preprocessing import MinMaxScaler

from sintel.db import DBExplorer, schema
from sintel.resources.auth_utils import verify_auth
from sintel.resources.computing.utils.search_similars import return_candidate_shapes

LOGGER = logging.getLogger(__name__)

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    'start', type=float, help='Start timestamp', required=True, location='args')
parser.add_argument(
    'end', type=float, help='End timestamp', required=True, location='args')
parser.add_argument(
    'datarun_id', type=str, help='ID of signalrun', required=True, location='args')
parser.add_argument(
    'metric', choices=['euclidean', 'dtw'], help='Distance metric',
    default="euclidean", location='args')
parser.add_argument(
    'number', type=int, help='Number of returned windows', default=100, location='args')


def get_windows(start, end, datarun_id, metric, number):
    # doc = schema.Prediction.find_one(signalrun=ObjectId(datarun_id))
    prediction_data = DBExplorer.get_prediction(datarun_id)
    timeseries = {
        'timestamp': [d[0] for d in prediction_data['data']],
        'value': [d[1] for d in prediction_data['data']]
    }
    df = pd.DataFrame(data=timeseries)

    # find the existing events
    event_docs = schema.Event.find(signalrun=datarun_id)
    events = [(doc.start_time, doc.stop_time) for doc in event_docs]

    # get candidate shapes
    windows, worst_dist = return_candidate_shapes(df, start, end, func=metric,
                                                  events=events)

    # represent it as similarities ranging from 0 to 100%
    scaler = MinMaxScaler(feature_range=[0, 1])
    X = np.asarray([w[2] for w in windows]).reshape(-1, 1)
    X_ = np.asarray([0, worst_dist]).reshape(-1, 1)
    scaler.fit(X_)
    X = scaler.transform(X).flatten()
    windows = [{'start': w[0], 'end': w[1], 'similarity': 1 - X[idx]}
               for idx, w in enumerate(windows)]
    windows.sort(key=lambda w: w['similarity'], reverse=True)

    return windows[: number]


class SimilarWindows(Resource):
    def get(self):
        """
        @api {get} /computings/similar_windows/ Get similar windows
        @apiName GetSimilarWindows
        @apiGroup Computing
        @apiVersion 1.0.0

        @apiParam {Number} start Start timestamp.
        @apiParam {Number} end End timestamp.
        @apiParam {String} datarun_id Datarun ID.
        @apiParam {String="euclidean","dtw"} metric Distance metric used in
            shapen matching.
        @apiParam {Number} [number=5] Number of similar windows to return.

        @apiSuccess {Object[]} windows A list of windows.
        @apiSuccess {Number} windows.start Window start timestamp.
        @apiSuccess {Number} windows.end Window end timestamp.
        @apiSuccess {Number} windows.distance Window end timestamp.
        """

        res, status = verify_auth()
        if status == 401:
            return res, status

        try:
            args = parser.parse_args()
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', str(e)}, 400

        try:
            windows = get_windows(**args)
        except Exception as e:
            LOGGER.exception(str(e))
            return {'message', 'error computing the similar shapes'}, 500

        return {
            'windows': windows
        }, 200
