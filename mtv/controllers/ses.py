from flask import request
from flask_restful import Resource
from pymongo import MongoClient

# print(datetime.fromtimestamp(1548257576796/1000))
# dt2 = datetime.utcfromtimestamp(1548257576796/1000)
# print(dt2.hour, dt2.minute)


db = MongoClient('localhost', 27017)['mtv']


class Signals(Resource):
    def get(self, db_name, sig_name):
        ''' return the signal data.

        Args:
            db_name (str): name of the database
            sig_name (str): signal id
            start (timestamp): query parameter. Start date.
            end (timestamp): query parameter. End date.

        Returns:
        '''

        start = request.args.get('start', None)
        end = request.args.get('end', None)

        print('signals', start, end)
        # range query
        if (start is not None) and (end is not None):
            docs = []
            cond = {'pid': sig_name, '$and': [
                {'timestamp': {'$gte': float(start)}},
                {'timestamp': {'$lte': float(end)}},
            ]}
            proj = {'_id': 0}
            finds = db['pids'].find(cond, proj)
            for doc in finds:
                docs.append(doc)
            return docs
        # by default, query all
        else:
            docs = []
            cond = {'pid': sig_name}
            proj = {'_id': 0}
            finds = db['pids'].find(cond, proj)
            for doc in finds:
                docs.append(doc)
            return docs

        # try:
        #     if (id not in signal_list):
        #         raise Exception("signal id {} doesn't exist in \
        #             database {}".format(db_name))
        #     # return jsonify(msg='success')
        #     return 'success'
        # except Exception as error:
        #     print('Caught this error: ' + repr(error))
        #     abort(404, repr(error))
