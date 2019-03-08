import csv
import os
import time
from datetime import datetime, timezone
from calendar import monthrange

import numpy as np

from db import MongoDB

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


def get_files(dir):
    result = []
    for (root, dirs, files) in os.walk(dir):
        result.extend(files)
    return result


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

    year_start = 9999;
    year_end = 0;

    for d in data:
        # nd -> the date of current item 
        # od -> the date of previous item 
        nd = datetime.utcfromtimestamp(d[0])

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
        for m in range(1, 12 + 1):
            dt = datetime(y, m, 1, tzinfo=timezone.utc)
            days = []
            for d in range(monthrange(y, m)[1]):
                days.append({
                    'bins': [0] * (24 * 60 // interval),
                    'counts': [0] * (24 * 60 // interval)
                })
        
            docs.append({
                'name': pid,
                'timestamp': dt.timestamp(),
                'year': dt.year,
                'month': dt.month,
                'days': days
            })

    for doc in odocs:
        ts = doc['timestamp']
        dt = datetime.utcfromtimestamp(ts)
        idx = (dt.year - year_start) * 12 + (dt.month - 1)
        docs[idx]['days'][dt.day - 1]['bins'] = doc['bins']
        docs[idx]['days'][dt.day - 1]['counts'] = doc['counts']

    return docs


if __name__ == "__main__":

    conn = MongoDB(address='localhost', port=27017, db='mtv')

    work_dir = os.getcwd()

    # SES
    ori_folder_path = './raw-data/ses/'

    pids = get_files(ori_folder_path)

    for pid in pids:
        path = os.path.join(ori_folder_path, pid)
        print(pid)
        with open(path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            old_time = None
            data = []
            time0 = time.time()
            for (i, v) in enumerate(csv_reader):
                data.append([float(v[2]), float(v[3])])

            time1 = time.time()
            print('reading over', time1 - time0)
            data.sort(key=(lambda x: x[0]))
            time2 = time.time()
            print('sorting over', time2 - time1)

            docs = transform_to_db_docs(pid[0:-4], data)

            if (docs is not None):
                conn.writeCollection(docs, 'raw')

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
