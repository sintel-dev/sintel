
# from scipy.spatial.distance import euclidean
# import pandas as pd
# from pyts.metrics import dtw
import numpy as np
from dtw import dtw as dtwc
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.preprocessing import MinMaxScaler
from tqdm import tqdm

# note: this algorithm is O(n ^ 4)! (since dtw is O(n ^ 3))


def minmax(a):
    max_a = a.max()
    min_a = a.min()
    for i in range(a.shape[0]):
        a[i] = (a[i] - min_a) * (max_a - min_a)
    return a


def euclidean(df, start_ts, end_ts):
    """ This function returns all the possible shape matches that do not overlap
    Args:
        * df (pd.DataFrame): original time series data.
        * start_ts: start timestamp of shape.
        * end_ts: end timestamp of shape.
    """
    time_column = 'timestamp'
    df = df.sort_values(time_column).set_index(time_column)

    segment = df.loc[start_ts:end_ts]
    window = segment.shape[0]
    found = list()

    def euclidean_dist(v1, v2):
        return sum((p - q)**2 for p, q in zip(v1, v2)) ** .5

    MinMaxScaler()
    x = np.array(segment['value'].values)
    x_ = minmax(x)
    for i in tqdm(range(0, len(df) - window)):
        # for i in range(0, len(df) - window):
        y = np.array(df.iloc[i:i + window]['value'].values)
        y_ = minmax(y)
        dist = euclidean_dist(x_, y_)
        # dist = euclidean_dist(x, y)

        found.append({"id": i, "cost": dist})

    # remove overlap
    found.sort(key=lambda x: x["cost"])
    no_overlap = list()

    for first_shape in found:
        first_range = range(first_shape["id"], first_shape["id"] + window)

        flag = True
        for second_shape in no_overlap:
            second_range = range(second_shape["id"], second_shape["id"] + window)

            xs = set(first_range)
            if len(xs.intersection(second_range)) > 0:
                flag = False

        if flag:
            no_overlap.append(first_shape)

    windows = [{'start': df.index[d['id']], 'end': df.index[d['id'] + window - 1],
                'cost': d['cost']} for d in no_overlap]

    return windows


def dtw(df, start_ts, end_ts):
    """ This function returns all the possible shape matches that do not overlap
    Args:
        * df (pd.DataFrame): original time series data.
        * start_ts: start timestamp of shape.
        * end_ts: end timestamp of shape.
    """
    time_column = 'timestamp'
    df = df.sort_values(time_column).set_index(time_column)

    segment = df.loc[start_ts:end_ts]
    window = segment.shape[0]
    found = list()

    x = np.array(segment['value'].values).reshape(-1, 1, 1)
    for i in tqdm(range(0, len(df) - window)):
        # for i in range(0, len(df) - window):
        y = np.array(df.iloc[i:i + window]['value'].values).reshape(-1, 1, 1)

        w = 5
        dist_fun = euclidean_distances
        dist, cost, acc, path = dtwc(x, y, dist_fun, w=w)

        found.append({"id": i, "path": path, "cost": dist})

    # remove overlap
    found.sort(key=lambda x: x["cost"])
    no_overlap = list()

    for first_shape in found:
        first_range = range(first_shape["id"], first_shape["id"] + window)

        flag = True
        for second_shape in no_overlap:
            second_range = range(second_shape["id"], second_shape["id"] + window)

            xs = set(first_range)
            if len(xs.intersection(second_range)) > 0:
                flag = False

        if flag:
            no_overlap.append(first_shape)
    # for d in no_overlap:
    #     print(d)
        # print(d['id'], d['id'] + window, df[d['id']]['timestamp'])
    # windows = [{'start': df[d['id']]['timestamp'], 'end': df[d['id']+window]['timestamp']}
    # for d in no_overlap]
    return []
