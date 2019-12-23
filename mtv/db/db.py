import logging
import pickle
from calendar import monthrange
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from pymongo import MongoClient

from mtv import model

LOGGER = logging.getLogger(__name__)

# private methods


def _inverse_scale_transform(v, a0, b0, a1, b1):
    """ return the original value after applying linear scale (a0, b0)

    Args:
        v (float): the value after transformation
        a0 (float): min of the values after transformation
        b0 (float): max of the values after transformation
        a1 (float): min of the original values
        b1 (float): max of the original values

    Returns:
        float: the original value
    """
    if b0 - a0 == 0:
        return 0

    k = (v - a0) / (b0 - a0)
    return k * (b1 - a1) + a1


def copy_from(fromdb, todb, fromhost='localhost', fromport=27017,
              tohost='localhost', toport=27017):
    to_client = MongoClient(tohost, port=toport)
    from_client = MongoClient(fromhost, port=fromport)

    cnames = ['comment', 'datarun', 'dataset', 'event',
              'experiment', 'pipeline', 'signal']

    for cname in cnames:
        to_col = to_client[todb][cname]
        from_col = from_client[fromdb][cname]

        for d in from_col.find({}):
            # copy new document
            if to_col.find_one({'_id': d['_id']}) is None:
                to_col.insert(d)


def copy_from2(fromdb, todb, fromhost='localhost', fromport=27017,
               tohost='localhost', toport=27017):
    client = MongoClient(tohost, port=toport)
    client.admin.command('copydb', fromdb=fromdb, todb=todb, fromhost=fromhost)


def update_db(fs, utc=True):

    # get datarun list
    dataruns = model.Datarun.find({}).timeout(False)
    cc = 0
    total = dataruns.count()

    # updated by dataruns
    for datarun in dataruns:
        try:
            cc += 1
            LOGGER.info('{}/{}: Processing datarun {}'.format(cc, total, datarun.id))

            # ------ Handle prediction -------- #
            if (model.Prediction.find_one(datarun=datarun.id) is not None):
                continue

            v = dict()
            for grid_out in fs.find({'datarun_id': datarun.id}, no_cursor_timeout=True):
                v[grid_out.variable] = pickle.loads(grid_out.read())

            data = list()

            nm_range = (np.nanmin(v['X_nm'], axis=0)[0], np.nanmax(v['X_nm'], axis=0)[0])
            raw_range = (np.nanmin(v['X_raw'], axis=0)[0], np.nanmax(v['X_raw'], axis=0)[0])

            # the first window does not have prediction values
            # fill the first window with the original values
            for i, idx in enumerate(v['raw_index']):
                if idx == v['target_index'][0]:
                    break

                data.append([
                    float(idx),
                    _inverse_scale_transform(v['X_nm'][i][0], *nm_range, *raw_range),
                    _inverse_scale_transform(v['X_nm'][i][0], *nm_range, *raw_range),
                    0.0,
                    v['X_nm'][i][0],
                    v['X_nm'][i][0],
                    0.0
                ])

            # append the subsequent values
            for i, idx in enumerate(v['target_index']):
                if nm_range[1] - nm_range[0] == 0:
                    raw_es = 0
                else:
                    raw_es = v['es'][i] / (nm_range[1] - nm_range[0]) * \
                        (raw_range[1] - raw_range[0])
                data.append([
                    float(idx),
                    _inverse_scale_transform(v['y'][i][0], *nm_range, *raw_range),
                    _inverse_scale_transform(v['y_hat'][i][0], *nm_range, *raw_range),
                    raw_es,
                    v['y'][i][0],
                    v['y_hat'][i][0],
                    v['es'][i]
                ])

            doc = {
                'signal': datarun.signal.id,
                'datarun': datarun.id,
                'names': ['timestamp', 'y_raw', 'y_raw_hat', 'es_raw',
                          'y', 'y_hat', 'es'],
                'data': data
            }

            model.Prediction(**doc).save()

            # ------ Handle Raw -------- #
            if (utc):
                year_start = datetime.utcfromtimestamp(v['raw_index'][0]).year
                year_end = datetime.utcfromtimestamp(v['raw_index'][-1]).year
            else:
                year_start = datetime.fromtimestamp(v['raw_index'][0]).year
                year_end = datetime.fromtimestamp(v['raw_index'][-1]).year

            # construct dataframe from ndarrays
            data = pd.DataFrame(data=v['X_raw'], index=v['raw_index'])

            # optimal interval for periodical description
            diff = (v['raw_index'][1] - v['raw_index'][0]) / 60
            my_interval = 1440
            for interval in [30, 60, 120, 180, 240, 360, 480, 720]:
                if diff <= interval:
                    my_interval = interval
                    break

            day_bin_num = 24 * 60 // my_interval

            docs = []
            # year
            for y in range(year_start, year_end + 1):
                if (utc):
                    dt = datetime(y, 1, 1, tzinfo=timezone.utc)
                else:
                    dt = datetime(y, 1, 1)

                docs.append({
                    'datarun': datarun.id,
                    'timestamp': dt.timestamp(),
                    'year': dt.year,
                    'data': [None for i in range(12)]
                })
                # month
                for m in range(1, 12 + 1):
                    days = []
                    # day
                    for d in range(monthrange(y, m)[1]):
                        days.append({'means': [], 'counts': []})
                        # bin
                        for n in range(day_bin_num):
                            if (utc):
                                st = datetime(y, m, d + 1, tzinfo=timezone.utc).timestamp() \
                                    + n * my_interval * 60
                                ed = datetime(y, m, d + 1, tzinfo=timezone.utc).timestamp() \
                                    + (n + 1) * my_interval * 60
                            else:
                                st = datetime(y, m, d + 1).timestamp() \
                                    + n * my_interval * 60
                                ed = datetime(y, m, d + 1).timestamp() \
                                    + (n + 1) * my_interval * 60
                            mean = data.loc[st:ed - 1].mean(skipna=True)[0]
                            count = data.loc[st:ed - 1].count()[0]
                            if (count == 0):
                                mean = 0
                            days[-1]['means'].append(float(mean))
                            days[-1]['counts'].append(int(count))
                        # end of bin
                    # end of day
                    docs[-1]['data'][m - 1] = days
                # end of month
            # end of year

            model.Raw.insert_many(docs)

        except Exception as e:
            print(e)
