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

def load_csv(file_path, start, stop, time_column, value_column, header):
    data = list()

    with open(file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        time0 = time.time()

        if (header):
            next(csv_reader, None)  # skip the header

        for (i, v) in enumerate(csv_reader):
            ts = float(v[time_column])
            # only add items from "start" to "stop" time
            if (start and ts < start):
                continue
            if (stop and ts > stop):
                continue
            data.append([float(v[time_column]), float(v[value_column])])

    return data

def to_mongo_raw(name, data, interval=30):
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
                    'name': name,
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
            'dataset': name,
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
