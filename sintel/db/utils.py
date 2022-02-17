import copy
import logging
import pickle
from calendar import monthrange
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.impute import SimpleImputer

from sintel.data import load_signal
from sintel.db import schema

LOGGER = logging.getLogger(__name__)


def _exp_is_in(exp, exp_filter):
    for f in exp_filter:
        name = f.get('name', None)
        exp_id = f.get('id', None)
        if name is not None and name == exp['name']:
            return True
        if exp_id is not None and exp_id == str(exp['_id']):
            return True


def _exp_is_in_for_mgeng(exp, exp_filter):
    if exp_filter is None:
        return True
    for f in exp_filter:
        name = f.get('name', None)
        exp_id = f.get('id', None)
        if name is not None and name == exp.name:
            return True
        if exp_id is not None and exp_id == str(exp.id):
            return True


def copy_from_partial(cols, fromdb, todb, fromhost='localhost', fromport=27017,
                      tohost='localhost', toport=27017, exp_filter=None):
    """Copy the given list of collections from ORION database to Sintel.

    If the collection already exists, it will further check whether all the
    documents are consistent. If not, copy all the newly added documents.

    Args:
        cols (List[str]):
            List of collection names.
        fromdb (str):
            Name of the origin database.
        todb (str):
            Name of the target database.
        fromhost (str):
            Host name or IP address of the origin database
        fromport (int):
            Port of the origin database
        tohost (str):
            Host name or IP address of the target database
        toport (int):
            Port of the target database
    """
    to_client = MongoClient(tohost, port=toport)
    from_client = MongoClient(fromhost, port=fromport)

    exp_col = from_client[fromdb]['experiment']
    dt_col = from_client[fromdb]['datarun']
    for col in cols:
        to_col = to_client[todb][col]
        from_col = from_client[fromdb][col]

        if exp_filter is None:
            for d in from_col.find({}):
                if to_col.find_one({'_id': d['_id']}) is None:
                    to_col.insert(d)
        else:
            if col == 'experiment':
                for d in from_col.find({}):
                    doc = to_col.find_one({'_id': d['_id']})
                    if _exp_is_in(d, exp_filter):
                        if doc is None:
                            to_col.insert(d)
            elif col == 'datarun':
                for d in from_col.find({}):
                    doc = to_col.find_one({'_id': d['_id']})
                    exp = exp_col.find_one({'_id': d['experiment']})
                    if _exp_is_in(exp, exp_filter):
                        if doc is None:
                            to_col.insert(d)
            #         else:
            #             if doc is not None:
            #                 to_col.delete_one({'_id': d['_id']})
            elif col == 'signalrun':
                for d in from_col.find({}):
                    doc = to_col.find_one({'_id': d['_id']})
                    eid = dt_col.find_one({'_id': d['datarun']})['experiment']
                    exp = exp_col.find_one({'_id': eid})
                    if _exp_is_in(exp, exp_filter):
                        if doc is None:
                            to_col.insert(d)
            else:
                for d in from_col.find({}):
                    doc = to_col.find_one({'_id': d['_id']})
                    if doc is None:
                        to_col.insert(d)

    # TODO: currently cannot handle the deleted items


def copy_from_entire(fromdb, todb, fromhost='localhost', fromport=27017,
                     tohost='localhost', toport=27017):
    """Refer to copy_from_partial for the parameter information."""
    client = MongoClient(tohost, port=toport)
    client.admin.command('copydb', fromdb=fromdb, todb=todb, fromhost=fromhost)


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


def _split_large_prediction_data(doc, signal):
    current_year = -1
    current_month = -1
    year_month_data = list()

    signal_start_dt = datetime.utcfromtimestamp(signal.start_time)

    for d in doc['data']:
        dt = datetime.utcfromtimestamp(d[0])
        y_idx = dt.year - signal_start_dt.year
        m_idx = dt.month
        index = y_idx * 12 + (m_idx - 1)
        if (dt.year != current_year or current_month != dt.month):
            if len(year_month_data) > 0:
                pred_doc = {
                    'signalrun': doc['signalrun'],
                    'attrs': doc['attrs'],
                    'index': index,
                    'data': year_month_data
                }
                schema.Prediction.insert(**pred_doc)
            year_month_data = list()
            current_year = dt.year
            current_month = dt.month

        year_month_data.append(d)

    # handle the last one
    if len(year_month_data) > 0:
        pred_doc = {
            'signalrun': doc['signalrun'],
            'attrs': doc['attrs'],
            'index': index,
            'data': year_month_data
        }
        schema.Prediction.insert(**pred_doc)


def _update_prediction(signalrun, v, stock=False):

    try:
        data = list()
        nm_range = (np.nanmin(v['X_nm'], axis=0)[0], np.nanmax(v['X_nm'], axis=0)[0])
        raw_range = (np.nanmin(v['X_raw'], axis=0)[0], np.nanmax(v['X_raw'], axis=0)[0])

        y_hat_is_list = isinstance(v['y_hat'][0][0], list)

        # for the prediction-based method
        # the first window does not have prediction values
        # fill the first window with the original values
        for i, idx in enumerate(v['raw_index']):
            if idx >= v['target_index'][0]:
                break

            if y_hat_is_list:
                y_hat_raw = [_inverse_scale_transform(
                    v['X_nm'][i][0], *nm_range, *raw_range) for h in v['y_hat'][0][0]]
                y_hat = [v['X_nm'][i][0]] * 5
            else:
                y_hat_raw = _inverse_scale_transform(
                    v['X_nm'][i][0], *nm_range, *raw_range)
                y_hat = v['X_nm'][i][0]

            data.append([
                float(idx),
                _inverse_scale_transform(v['X_nm'][i][0], *nm_range, *raw_range),
                y_hat_raw,
                0.0,
                v['X_nm'][i][0],
                y_hat,
                0.0
            ])

        # remove the last elements until they have both length
        while len(v['target_index']) > len(v['y_hat']):
            v['target_index'] = v['target_index'][:-1]

        for i, idx in enumerate(v['target_index']):
            if nm_range[1] - nm_range[0] == 0:
                raw_es = 0
            else:
                raw_es = v['es'][i] / (nm_range[1] - nm_range[0]) * \
                    (raw_range[1] - raw_range[0])

            if y_hat_is_list:
                y_hat_raw = [_inverse_scale_transform(
                    h, *nm_range, *raw_range) for h in v['y_hat'][i][0]]
            else:
                y_hat_raw = _inverse_scale_transform(
                    v['y_hat'][i][0], *nm_range, *raw_range)

            try:
                data.append([
                    float(idx),
                    _inverse_scale_transform(v['y'][i][0], *nm_range, *raw_range),
                    y_hat_raw,
                    raw_es,
                    v['y'][i][0],
                    v['y_hat'][i][0],
                    v['es'][i]
                ])
            except Exception:
                print(idx, type(idx))

        data_ = copy.deepcopy(data)

        # convert format
        for i in range(len(data)):
            data[i][1] = float(data[i][1])
            data[i][3] = float(data[i][3])
            data[i][4] = float(data[i][4])
            data[i][6] = float(data[i][6])
            if y_hat_is_list:
                # data[i][2] = [float(d2) for d2 in data[i][2]]
                # data[i][5] = [float(d5) for d5 in data[i][5]]
                # TODO
                data[i][2] = float(data[i][2][2])
                data[i][5] = float(data[i][5][2])
            else:
                data[i][2] = float(data[i][2])
                data[i][5] = float(data[i][5])

            if signalrun.signal.name[0] != '%':
                continue
            if (i == 0):
                for j in range(1, 7):
                    data_[i][j] = 0
            else:
                data_[i][3] = float(data[i][3])
                data_[i][6] = float(data[i][6])

                if (data[i - 1][1] == 0):
                    data_[i][1] = 0
                    data_[i][2] = 0
                else:
                    data_[i][1] = (data[i][1] - data[i - 1][1]) / data[i - 1][1] * 100
                    data_[i][2] = (data[i][2] - data[i - 1][1]) / data[i - 1][1] * 100

                if (data[i - 1][4] == 0):
                    data_[i][4] = 0
                    data_[i][5] = 0
                else:
                    data_[i][4] = (data[i][4] - data[i - 1][4]) / data[i - 1][4] * 100
                    data_[i][5] = (data[i][5] - data[i - 1][4]) / data[i - 1][4] * 100
        if signalrun.signal.name[0] != '%':
            data_ = data
        doc = {
            'signalrun': signalrun.id,
            'attrs': ['timestamp',
                      'y_raw', 'y_raw_hat', 'es_raw',
                      'y', 'y_hat', 'es'],
            'data': data_
        }

        _split_large_prediction_data(doc, signalrun.signal)
    except Exception as e:
        print(e)


def _update_period(signalrun, v, stock=False):
    year_start = datetime.utcfromtimestamp(v['raw_index'][0]).year
    year_end = datetime.utcfromtimestamp(v['raw_index'][-1]).year

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
        dt = datetime(y, 1, 1, tzinfo=timezone.utc)

        docs.append({
            'signalrun': signalrun.id,
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
                    st = datetime(y, m, d + 1, tzinfo=timezone.utc).timestamp() \
                        + n * my_interval * 60
                    ed = datetime(y, m, d + 1, tzinfo=timezone.utc).timestamp() \
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

    schema.Period.insert_many(docs)


def _update_raw(signal, interval=21600, method=['mean'], stock=False):
    # interval should be changed case by case
    # ses -> 360 seconds
    # nasa -> 4 hours
    # stock -> 1 day
    X = load_signal(signal.data_location, timestamp_column=signal.timestamp_column,
                    value_column=signal.value_column, stock=stock)

    if signal.start_time:
        X = X[X['timestamp'] >= signal.start_time].copy()
    if signal.stop_time:
        X = X[X['timestamp'] <= signal.stop_time].copy()
    X = X.sort_values('timestamp').set_index('timestamp')

    signal_start_dt = datetime.utcfromtimestamp(signal.start_time)

    if stock:
        # day - 24 hour
        values = X.values
        index = X.index.values
        interval = 24 * 60 * 60
    else:
        start_ts = X.index.values[0]
        max_ts = X.index.values[-1]

        values = list()
        index = list()
        while start_ts <= max_ts:
            end_ts = start_ts + interval
            subset = X.loc[start_ts:end_ts - 1]
            aggregated = [
                getattr(subset, agg)(skipna=True).values
                for agg in method
            ]
            values.append(np.concatenate(aggregated))
            index.append(start_ts)
            start_ts = end_ts

        imp_mean = SimpleImputer(missing_values=np.nan, strategy='mean')
        V = np.asarray(values).reshape((-1, 1))
        V = imp_mean.fit_transform(V)
        values = V.flatten().tolist()

    current_year = -1
    current_month = -1
    year_month_data = list()
    for i, v in zip(index, values):

        dt = datetime.utcfromtimestamp(i)
        y_idx = dt.year - signal_start_dt.year
        m_idx = dt.month
        idx = y_idx * 12 + (m_idx - 1)
        if (dt.year != current_year or current_month != dt.month):

            if len(year_month_data) > 0:
                raw_doc = {
                    'signal': signal.id,
                    'index': idx,
                    'data': year_month_data,
                    'interval': interval
                }
                schema.SignalRaw.insert(**raw_doc)
            year_month_data = list()
            current_year = dt.year
            current_month = dt.month

        year_month_data.append([float(i), float(v)])

    # handle the last one
    if len(year_month_data) > 0:
        raw_doc = {
            'signal': signal.id,
            'index': idx,
            'data': year_month_data
        }
        schema.SignalRaw.insert(**raw_doc)


def update_db(fs, exp_filter=None, stock=False):

    # get signalrun list

    # TODO: remove utc setting, it should be always True
    signals = schema.Signal.find().timeout(False)
    cc = 0
    total = signals.count()
    for signal in signals:
        try:
            cc += 1
            LOGGER.info('{}/{}: Processing signal {}'.format(cc, total, signal.name))
            if not schema.SignalRaw.find_one(signal=signal):
                _update_raw(signal, stock=stock)
            else:
                LOGGER.info('Skip - this signal data has been processed previously')
        except Exception as e:
            LOGGER.error(str(e))

    signalruns = schema.Signalrun.find({}).timeout(False)
    cc = 0
    total = signalruns.count()
    for signalrun in signalruns:
        try:
            cc += 1
            LOGGER.info('{}/{}: Processing signalrun {}'.format(cc, total, signalrun.id))
            LOGGER.info('Pipeline name %s', signalrun.datarun.pipeline.name)
            if not _exp_is_in_for_mgeng(signalrun.datarun.experiment, exp_filter):
                continue

            # ------ Prediction -------- #
            if (schema.Prediction.find_one(signalrun=signalrun.id) is not None):
                LOGGER.info('Skip - this signalrun has been processed previously')
                continue
            else:
                v = dict()
                for grid_out in fs.find({'signalrun_id': signalrun.id}, no_cursor_timeout=True):
                    v[grid_out.variable] = pickle.loads(grid_out.read())
                _update_prediction(signalrun, v, stock=stock)

            # ------ Period -------- #
            if (schema.Period.find_one(signalrun=signalrun.id) is not None):
                continue
            else:
                _update_period(signalrun, v, stock=stock)

        except Exception as e:
            print(e)


def merge_databases():
    pass


def delete_datasets():
    cli = MongoClient('localhost', port=27017)
    db = cli['sintel']

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


def main():
    pass
