import csv
import os
import time
from datetime import datetime

import numpy as np

from db import MongoDB

# timestamp = date.fromtimestamp(1326244364)
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


def transform_to_db_docs(pid, data):
    docs = []
    od = None
    data.append([datetime.now().timestamp(), 0])

    day_bins = []
    for i in range(24 * 60):
        day_bins.append([])
    for d in data:
        nd = datetime.fromtimestamp(d[0])
        if ((od is None) or not (nd.year == od.year and nd.month == od.month
                                 and nd.day == od.day)):
            if (od is not None):
                bins = []
                counts = []
                # print(day_bins[0])
                for i in range(24 * 60):
                    if (len(day_bins[i]) > 0):
                        bins.append(np.mean(day_bins[i]))
                    else:
                        bins.append(0)
                    counts.append(len(day_bins[i]))
                now = datetime(od.year, od.month, od.day)
                docs.append({
                    'pid': pid,
                    'timestamp': now.timestamp(),
                    'date': now.isoformat(),
                    'bins': bins,
                    'counts': counts,
                })
                day_bins = []
                for i in range(24 * 60):
                    day_bins.append([])

        h = nd.hour
        m = nd.minute
        idx = h * 60 + m  # get minute of the day
        day_bins[idx].append(d[1])

        od = nd
    return docs
    # print(len(docs))
    # print(docs[20])


if __name__ == "__main__":

    conn = MongoDB(address='localhost', port=27017, db='mtv')

    work_dir = os.getcwd()

    ori_folder_path = './raw-data/ses/pids'

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

            docs = transform_to_db_docs(pid[4:-4], data)

            conn.writeCollection(docs, 'pids')

    conn.createIndex('pids')
