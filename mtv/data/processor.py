import csv
import logging
import os
import time
from calendar import monthrange
from datetime import datetime, timezone

import numpy as np

from mtv.data.db import MongoDB
from mtv.utils import get_files

LOGGER = logging.getLogger(__name__)

# test code
# t1 = datetime.fromtimestamp(1328214364)
# t2 = datetime.utcfromtimestamp(1328214364)
# nd = datetime(t2.year, t2.month, t2.day, tzinfo=timezone.utc)
# timestamp2 = datetime.fromtimestamp(1326244364)
# print("Date =", timestamp2.utctimetuple())
# print("Date =", timestamp2.hour)
# print("Date =", timestamp2.minute)
# print("Date =", timestamp2.second)
# print(datetime(2018, 9, 12))


def transform_to_db_docs(pid, data, interval=30):
    odocs = []
    od = None
    data.append([datetime.now().timestamp(), 0])

    # check
    if (not 60 % interval == 0):
        print('60 should be divisible by interval.')
        return None

    day_bins = []
    for i in range(24 * 60 // interval):
        day_bins.append([])

    year_start = 9999
    year_end = 0

    for (di, d) in enumerate(data):
        # nd -> the date of current item
        # od -> the date of previous item
        nd = datetime.utcfromtimestamp(d[0])

        # not the last one
        if not (di + 1) == len(data):
            year_start = nd.year if (nd.year < year_start) else year_start
            year_end = nd.year if (nd.year > year_end) else year_end

        # when a new day comes
        if ((od is None) or not (nd.year == od.year and nd.month == od.month
                                 and nd.day == od.day)):
            if (od is not None):
                bins = []
                counts = []
                for i in range(24 * 60 // interval):
                    if (len(day_bins[i]) > 0):
                        bins.append(np.mean(day_bins[i]))
                    else:
                        bins.append(0)
                    counts.append(len(day_bins[i]))

                now = datetime(od.year, od.month, od.day, tzinfo=timezone.utc)
                odocs.append({
                    'name': pid,
                    'timestamp': now.timestamp(),
                    'date': now.isoformat(),
                    'bins': bins,
                    'counts': counts,
                })
                day_bins = []
                for i in range(24 * 60 // interval):
                    day_bins.append([])

        h = nd.hour
        m = nd.minute
        idx = (h * 60 + m) // interval  # get minute of the day
        day_bins[idx].append(d[1])
        od = nd

    # now every doc is a day.
    # aggregate docs from the same month into one doc

    docs = []
    for y in range(year_start, year_end + 1):

        dt = datetime(y, 1, 1, tzinfo=timezone.utc)

        docs.append({
            'dataset': pid,
            'timestamp': dt.timestamp(),
            'year': dt.year,
            'data': [None for i in range(12)]
        })

        for m in range(1, 12 + 1):
            days = []
            for d in range(monthrange(y, m)[1]):
                days.append({
                    'means': [0] * (24 * 60 // interval),
                    'counts': [0] * (24 * 60 // interval)
                })

            docs[-1]['data'][m - 1] = days

    for doc in odocs:
        ts = doc['timestamp']
        dt = datetime.utcfromtimestamp(ts)
        idx = dt.year - year_start
        docs[idx]['data'][dt.month - 1][dt.day - 1]['means'] = doc['bins']
        docs[idx]['data'][dt.month - 1][dt.day - 1]['counts'] = doc['counts']

    return docs


def add_raw(conn_config, col, data_folder_path):
    conn = MongoDB(**conn_config)

    if not os.path.exists(data_folder_path):
        LOGGER.exception('Data folder path "{}" does not exist'
                         .format(data_folder_path))
        raise

    files = get_files(data_folder_path)

    cc = 0
    for file in files:
        file_path = os.path.join(data_folder_path, file)
        cc += 1
        print('{}/{}: processing {}'.format(cc, len(files), file))

        with open(file_path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            data = list()
            time0 = time.time()
            for (i, v) in enumerate(csv_reader):
                ts = float(v[2])
                # only add items in the range 2010.1.1 to 2017.12.31
                if (ts >= 1262304000 and ts <= 1514764799):
                    data.append([float(v[2]), float(v[3])])
            time1 = time.time()
            print('reading over', time1 - time0)
            data.sort(key=(lambda x: x[0]))
            time2 = time.time()
            print('sorting over', time2 - time1)

            docs = transform_to_db_docs(file[0:-4], data)

            if docs:
                conn.writeCollection(docs, col)

    conn.createIndex(col, [('dataset', '+')], unique=False)
    conn.createIndex(col, [('dataset', '+'), ('year', '+')])

    # # NASA MSL
    # ori_folder_path = './raw-data/nasa/MSL/'

    # pids = get_files(ori_folder_path)

    # for pid in pids:
    #     path = os.path.join(ori_folder_path, pid)
    #     print(pid)
    #     with open(path, 'r') as csv_file:
    #         csv_reader = csv.reader(csv_file, delimiter=',')
    #         old_time = None
    #         data = []
    #         time0 = time.time()
    #         next(csv_reader, None)  # skip the headers
    #         for (i, v) in enumerate(csv_reader):
    #             data.append([float(v[0]), float(v[1])])

    #         time1 = time.time()
    #         print('reading over', time1 - time0)
    #         data.sort(key=(lambda x: x[0]))
    #         time2 = time.time()
    #         print('sorting over', time2 - time1)

    #         docs = transform_to_db_docs(pid[0:-4], data)

    #         if (docs is not None):
    #             conn.writeCollection(docs, 'raw')

    # # NASA SMAP
    # ori_folder_path = './raw-data/nasa/SMAP/'

    # pids = get_files(ori_folder_path)

    # for pid in pids:
    #     path = os.path.join(ori_folder_path, pid)
    #     print(pid)
    #     with open(path, 'r') as csv_file:
    #         csv_reader = csv.reader(csv_file, delimiter=',')
    #         old_time = None
    #         data = []
    #         time0 = time.time()
    #         next(csv_reader, None)  # skip the headers
    #         for (i, v) in enumerate(csv_reader):
    #             data.append([float(v[0]), float(v[1])])

    #         time1 = time.time()
    #         print('reading over', time1 - time0)
    #         data.sort(key=(lambda x: x[0]))
    #         time2 = time.time()
    #         print('sorting over', time2 - time1)

    #         docs = transform_to_db_docs(pid[0:-4], data)

    #         if (docs is not None):
    #             conn.writeCollection(docs, 'raw')

    # conn.createIndex('raw')
