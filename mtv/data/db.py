from pprint import pprint

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.errors import BulkWriteError


class MongoDB:

    def __init__(self, address='localhost', port=27017, db='ctscan'):
        client = MongoClient(address, port)
        self.db = client[db]
        print('connect to {} on {}:{}'.format(db, address, port))

    def read(self, col):
        docs = []
        for doc in self.db[col].find():
            docs.append(doc)
        return docs

    def writeCollection(self, data, col, insert_type='many',
                        batch_num=200, bulk_type='unordered'):
        """write data to specified collection

        Parameters
        ----------
        col : string. collection name
        type : string. one, many, bulk
        """
        if insert_type == 'many':
            if (isinstance(data, list) or isinstance(data, dict)):
                self.db[col].insert_many(data)
            else:
                print('input data type is not "list" or "dict" when execute \
                    insert_many')
        elif insert_type == 'one':
            if (isinstance(data, list)):
                for v in data:
                    self.db[col].insert(v)
            elif (isinstance(data, dict)):
                self.db[col].insert(data)
        elif insert_type == 'bulk':
            bulk = self.new_bulk(col, bulk_type)
            if (isinstance(data, list)):
                for i, e in enumerate(data):
                    bulk.insert(e)
                    if (i + 1) % batch_num == 0:
                        try:
                            # print (i)
                            bulk.execute()
                        except BulkWriteError as bwe:
                            pprint(bwe.details)
                        bulk = self.new_bulk(col, bulk_type)
            if len(data) % batch_num > 0:
                try:
                    bulk.execute()
                except BulkWriteError as bwe:
                    pprint(bwe.details)

    def new_bulk(self, col, bulk_type):
        if bulk_type == 'unordered':
            return self.db[col].initialize_unordered_bulk_op()
        else:
            return self.db[col].initialize_ordered_bulk_op()

    def createIndex(self, col, pairs, unique=True):
        indexes = list()
        for pair in pairs:
            order = ASCENDING if pair[1] == '+' else DESCENDING
            indexes.append((pair[0], order))
        self.db[col].create_index(indexes, unique=unique)

        print('create index successfully on collection "{}"'.format(col))

    def del_col(self, col):
        self.db[col].drop()

    def move_col(self, col, des_db, des_col):
        print('reading', col)
        docs = self.read(col)
        print('#item:', len(docs))

        w_conn = MongoDB(address='localhost', port=27018, db=des_db)
        w_conn.writeCollection(docs, des_col, insert_type='bulk')
