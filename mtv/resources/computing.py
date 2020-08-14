import logging

import numpy as np
import pandas as pd
from bson import ObjectId
from flask import request
from flask_restful import Resource
from sklearn.preprocessing import MinMaxScaler

from mtv.computings.search_similars import return_candidate_shapes
from mtv.db import schema

LOGGER = logging.getLogger(__name__)


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
        @apiParam {Number} [number=5] Number of similar windows to return.

        @apiSuccess {Object[]} windows A list of windows.
        @apiSuccess {Number} windows.start Window start timestamp.
        @apiSuccess {Number} windows.end Window end timestamp.
        @apiSuccess {Number} windows.distance Window end timestamp.
        """

        # res, status = verify_auth()
        # if status == 401:
        #     return res, status

        start = request.args.get('start', None)
        end = request.args.get('end', None)
        datarun_id = request.args.get('datarun_id', None)
        # window_number = request.args.get('number', None)
        if (datarun_id is None) or (start is None) or (end is None):
            LOGGER.exception('Error searching similar windows: missing args.')
            raise
        try:
            start = float(start)
            end = float(end)
        except BaseException:
            LOGGER.exception('Error searching similar windows: wrong arg types.')

        doc = schema.Prediction.find_one(signalrun=ObjectId(datarun_id))
        timeseries = {
            'timestamp': [d[0] for d in doc.data],
            'value': [d[1] for d in doc.data]
        }
        df = pd.DataFrame(data=timeseries)
        windows, worst_dist = return_candidate_shapes(df, start, end, func='euclidean')
        # windows, worst_dist = return_candidate_shapes(df, start, end, func='dtw')

        # reformat
        scaler = MinMaxScaler(feature_range=[0, 1])
        X = np.asarray([w[2] for w in windows]).reshape(-1, 1)
        X_ = np.asarray([0, worst_dist]).reshape(-1, 1)
        scaler.fit(X_)
        X = scaler.transform(X).flatten()

        windows = [{'start': w[0], 'end': w[1], 'similarity': 1 - X[idx]}
                   for idx, w in enumerate(windows)]
        windows.sort(key=lambda w: w['similarity'], reverse=True)
        windows = windows[: 5]
        return {
            'windows': windows
        }
