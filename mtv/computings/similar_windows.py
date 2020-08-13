
from scipy.spatial.distance import euclidean
import pandas as pd
import numpy as np
# from pyts.metrics import dtw
# from dtw import dtw as dtwc
# from sklearn.metrics.pairwise import euclidean_distances
# from sklearn.preprocessing import MinMaxScaler
# from tqdm import tqdm

# note: this algorithm is O(n^4)! (since dtw is O(n^3))


# def minmax(a):
#     max_a = a.max()
#     min_a = a.min()
#     for i in range(a.shape[0]):
#         a[i] = (a[i] - min_a) * (max_a - min_a)
#     return a


# def euclidean(df, start_ts, end_ts):
#     """ This function returns all the possible shape matches that do not overlap
#     Args:
#         * df (pd.DataFrame): original time series data.
#         * start_ts: start timestamp of shape.
#         * end_ts: end timestamp of shape.
#     """
#     time_column = 'timestamp'
#     df = df.sort_values(time_column).set_index(time_column)

#     segment = df.loc[start_ts:end_ts]
#     window = segment.shape[0]
#     found = list()

#     def euclidean_dist(v1, v2):
#         return sum((p - q)**2 for p, q in zip(v1, v2)) ** .5

#     MinMaxScaler()
#     x = np.array(segment['value'].values)
#     x_ = minmax(x)
#     for i in tqdm(range(0, len(df) - window)):
#         # for i in range(0, len(df) - window):
#         y = np.array(df.iloc[i:i + window]['value'].values)
#         y_ = minmax(y)
#         dist = euclidean_dist(x_, y_)
#         # dist = euclidean_dist(x, y)

#         found.append({"id": i, "cost": dist})

#     # remove overlap
#     found.sort(key=lambda x: x["cost"])
#     no_overlap = list()

#     for first_shape in found:
#         first_range = range(first_shape["id"], first_shape["id"] + window)

#         flag = True
#         for second_shape in no_overlap:
#             second_range = range(second_shape["id"], second_shape["id"] + window)

#             xs = set(first_range)
#             if len(xs.intersection(second_range)) > 0:
#                 flag = False

#         if flag:
#             no_overlap.append(first_shape)

#     windows = [{'start': df.index[d['id']], 'end': df.index[d['id'] + window - 1],
#                 'cost': d['cost']} for d in no_overlap]

#     return windows


# def dtw(df, start_ts, end_ts):
#     """ This function returns all the possible shape matches that do not overlap
#     Args:
#         * df (pd.DataFrame): original time series data.
#         * start_ts: start timestamp of shape.
#         * end_ts: end timestamp of shape.
#     """
#     time_column = 'timestamp'
#     df = df.sort_values(time_column).set_index(time_column)

#     segment = df.loc[start_ts:end_ts]
#     window = segment.shape[0]
#     found = list()

#     x = np.array(segment['value'].values).reshape(-1, 1, 1)
#     for i in tqdm(range(0, len(df) - window)):
#         # for i in range(0, len(df) - window):
#         y = np.array(df.iloc[i:i + window]['value'].values).reshape(-1, 1, 1)

#         w = 5
#         dist_fun = euclidean_distances
#         dist, cost, acc, path = dtwc(x, y, dist_fun, w=w)

#         found.append({"id": i, "path": path, "cost": dist})

#     # remove overlap
#     found.sort(key=lambda x: x["cost"])
#     no_overlap = list()

#     for first_shape in found:
#         first_range = range(first_shape["id"], first_shape["id"] + window)

#         flag = True
#         for second_shape in no_overlap:
#             second_range = range(second_shape["id"], second_shape["id"] + window)

#             xs = set(first_range)
#             if len(xs.intersection(second_range)) > 0:
#                 flag = False

#         if flag:
#             no_overlap.append(first_shape)
#     # for d in no_overlap:
#     #     print(d)
#         # print(d['id'], d['id'] + window, df[d['id']]['timestamp'])
#     # windows = [{'start': df[d['id']]['timestamp'], 'end': df[d['id']+window]['timestamp']}
#     # for d in no_overlap]
#     return []


""" Shape Matching.
​
This functionality serves as a shape matching search algorithm.
Given a signal and a particular shape, it returns a list of
(start timestamp, end timestamp, distance score) of each
candidate shape within the signal.
"""


def return_candidate_shapes(X, shape, func=euclidean, step_size=1,
                            time_column='timestamp', target_column='value'):
    """ This function returns all the possible shape matches that do not overlap.
​
    Args:
        X (ndarray or `pandas.DataFrame`):
            Time series array to search in.
        shape (ndarray or `pandas.DataFrame`):
            Vector of desired shape.
        func (method):
            Function that returns the similarity. If no function is given, use euclidean distance.
        step_size (int):
            Indicating the number of steps to move forward each round.
        time_column (str or int):
            Column of X that contains time values.
        target_column (str or int):
            Column of X that contains target values.

    Returns:
        list:
            A list of tuples with (start, end, similarity score) timestamps of matched shapes.
    """
    if isinstance(X, np.ndarray):
        X = pd.DataFrame(X)

    X = X.sort_values(time_column).set_index(time_column)

    window_size = shape.shape[0]
    matched = list()

    start = 0
    max_start = len(X) - window_size + 1

    previous, current, after = (np.inf, []), (np.inf, []), (np.inf, [])
    checkpoint = window_size

    while start < max_start:
        end = start + window_size

        x = np.array(X.iloc[start:end]).flatten()
        dist = func(x, shape)

        if dist < after[0]:
            after = (dist, range(start, end))

        if start > checkpoint or start + step_size >= max_start:
            # time range
            prevset = set(previous[1])
            aftset = set(after[1])

            # overlap
            if prevset.intersection(current[1]):
                if current[0] > previous[0]:
                    # add previous
                    idx_start = X.index[previous[1][0]]
                    idx_end = X.index[previous[1][-1]]
                    matched.append((idx_start, idx_end, previous[0]))

                    current = (np.inf, [])

                elif aftset.intersection(current[1]) and after[0] < current[0]:
                    # add previous
                    idx_start = X.index[previous[1][0]]
                    idx_end = X.index[previous[1][-1]]
                    matched.append((idx_start, idx_end, previous[0]))

                    current = (np.inf, [])

                elif start + step_size >= max_start:  # edge case
                    # add current
                    idx_start = X.index[current[1][0]]
                    idx_end = X.index[current[1][-1]]
                    matched.append((idx_start, idx_end, current[0]))

            # no overlap
            elif previous[1]:
                # add previous
                idx_start = X.index[previous[1][0]]
                idx_end = X.index[previous[1][-1]]
                matched.append((idx_start, idx_end, previous[0]))

            previous = current
            current = after
            after = (np.inf, [])

            checkpoint = checkpoint + window_size

        start = start + step_size

    return matched


# example
if __name__ == '__main__':
    samples = 200
    f = 4
    t = np.arange(samples)
    x = np.sin(3 * np.pi * f * t / 100).reshape((-1, 1))
    noise = np.random.normal(0, 0.2, size=x.shape)
    x = x + noise
    window_size = 10
    i = np.random.choice(range(0, len(x) - window_size))
    shape = x[i: i + window_size]
    X = pd.DataFrame({'timestamp': t, 'value': x.flatten()})

    def _pdtw(x, shape):
        return pdtw(x, shape, method="itakura", options={"max_slope": 1.5})

    candidate_shapes = return_candidate_shapes(X, shape, func=_pdtw)
