from flask import abort, request
from flask_restful import Resource

from mtv.utils.helper import get_dirs, get_files


class DBs(Resource):
    def get(self):
        ''' Return database list

        Returns:
            (array): array of database names
        '''
        return get_dirs("./client/public/data/")


class Signals(Resource):
    def get(self, db_name):
        ''' By default, return the signal list of a database. If a signal id is
        given, return the signal data.

        Args:
            db_name (string): name of the database

        Returns:

        '''

        signal_list = get_files("./client/public/data/{}/".format(db_name))
        signal_list = [s[:-4] for s in signal_list]   # remove .csv

        id = request.args.get('id', None)
        print(id)

        if (id is None):
            return signal_list
        else:
            try:
                if (id not in signal_list):
                    raise Exception("signal id {} doesn't exist in \
                        database {}".format(db_name))
                # return jsonify(msg='success')
                return 'success'
            except Exception as error:
                print('Caught this error: ' + repr(error))
                abort(404, repr(error))
