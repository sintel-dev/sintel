from flask_restful import Resource

from mtv.utils.helper import get_dirs, get_files


class DBList(Resource):
    def get(self):
        ''' Return database list.

        Returns:
            (array[string]): array of database names
        '''
        return get_dirs("./client/public/data/")


class SignalList(Resource):
    def get(self, db_name):
        '''Return the signal list of a database.

        Args:
            db_name (string): name of the database

        Returns:
        '''

        signal_list = get_files("./client/public/data/{}/".format(db_name))
        signal_list = [s[:-4] for s in signal_list]   # remove .csv

        return signal_list
