import logging

from bson import ObjectId
from flask import request
from flask_restful import Resource

from mtv import model
from mtv.resources.auth_utils import verify_auth
from mtv.computings import similar_windows
import pandas as pd

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
        """

        # res, status = verify_auth()
        # if status == 401:
        #     return res, status

        start = request.args.get('start', None)
        end = request.args.get('end', None)
        datarun_id = request.args.get('datarun_id', None)
        window_number = request.args.get('number', None)
        if (datarun_id is None) or (start is None) or (end is None):
            LOGGER.exception('Error searching similar windows: missing args.')
            raise
        try:
            start = float(start)
            end = float(end)
        except:
            LOGGER.exception('Error searching similar windows: wrong arg types.')

        doc = model.Prediction.find_one(datarun=ObjectId(datarun_id))
        # extract 'y_raw'
        timeseries = {
            'timestamp': [d[0] for d in doc.data],
            'value': [d[1] for d in doc.data]
        }
        df = pd.DataFrame(data=timeseries)
        # windows = similar_windows.dtw(df, start, end)
        windows = similar_windows.euclidean(df, start, end)
        windows = windows[:int(window_number)]
        return {
            'windows': windows
        }
