
import logging
from pymongo import MongoClient
from bson import ObjectId


LOGGER = logging.getLogger(__name__)


def merge_databases():
    pass

def prune_dataruns():
    cli = MongoClient('localhost', port=27017)
    db = cli['mtv-nasa-lstm']
    col = db['datarun']

    needed = ['T-1', 'E-8', 'E-9', 'P-2', 'P-3', 'P-4', 'P-11', 
              'A-9', 'A-8', 'S-1', 'E-2']


    for x in col.find():
        doc = db['signal'].find_one({'_id': x['signal']})
        if doc['name'] not in needed:
            col.delete_one({'_id': x['_id']})
            print('{} is deleted'.format(doc['name']))

    # clean Prediction & Raw
    for x in db['prediction'].find():
        doc = col.find_one(x['datarun'])
        if doc is None:
            db['prediction'].delete_one({'_id': x['_id']})
    
    for x in db['raw'].find():
        doc = col.find_one(x['datarun'])
        if doc is None:
            db['raw'].delete_one({'_id': x['_id']})

def test_area():
    print('test_area')
    LOGGER.info('test_area')
    pass

def main():
    # test_area()

    prune_dataruns()

