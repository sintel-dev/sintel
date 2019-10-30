
import logging
from pymongo import MongoClient
from bson import ObjectId


LOGGER = logging.getLogger(__name__)


def merge_databases():
    pass

def delete_datasets():
    cli = MongoClient('localhost', port=27017)
    db = cli['mtv']

    for datarun_doc in db['datarun'].find():
        experiment_id = datarun_doc['experiment']
        experiment_doc = db['experiment'].find_one({'_id': experiment_id})
        if (experiment_doc['project'] == 'SES'):
            # delete datarun
            db['datarun'].delete_one({'_id': datarun_doc['_id']})
            # delete raw
            db['raw'].delete_many({'datarun': datarun_doc['_id']})
            # delete prediction
            db['prediction'].delete_many({'datarun': datarun_doc['_id']})

    for experiment_doc in db['experiment'].find():
        if (experiment_doc['project'] == 'SES'):
            db['experiment'].delete_one({'_id': experiment_doc['_id']})


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

    # prune_dataruns()
    delete_datasets()

