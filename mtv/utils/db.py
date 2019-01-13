import os

from pymongo import MongoClient


class MongoDB(object):

    def __init__(self, config={}):
        '''MongoDB Class

        Args:
            config (object): flask app config object,
            please find it via ./server/config.py.

        '''
        if os.environ.get('DB_PORT_27017_TCP_ADDR'):  # used for docker test
            host = os.environ["DB_PORT_27017_TCP_ADDR"]
        else:
            host = config.get('host', 'localhost')
        port = config.get('port', 27017)
        database = config.get('db', 'mtv')
        # user = config.get('user')
        # password = config.get('password')

        # Connect to mongodb
        db = MongoClient(host, port)[database]

        self.db = db

    def read(self, col):
        docs = []
        for doc in self.db[col].find():
            docs.append(doc)
        return docs

    def insert_one(self, col, doc):
        return self.db[col].insert_one(doc)
