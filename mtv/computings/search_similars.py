
""" Shape Matching.

This functionality serves as a shape matching search algorithm.
Given a signal and a particular shape, it returns a list of
(start timestamp, end timestamp, distance) of each
candidate shape within the signal.
"""

import numpy as np
import pandas as pd
from pyts.metrics import dtw as pdtw
from scipy.spatial.distance import euclidean
from sklearn.preprocessing import MinMaxScaler


def _pdtw(x, shape):
    return pdtw(x, shape, method="itakura", options={"max_slope": 1.5})


def return_candidate_shapes(X, start_time, end_time, func='euclidean', step_size=1,
                            time_column='timestamp', target_column='value'):
    """ This function returns all the possible shape matches that do not overlap.

    Args:
        X (ndarray or `pandas.DataFrame`):
            Time series array to search in.
        shape (ndarray or `pandas.DataFrame`):
            Vector of desired shape.
        func (method):
            Function that returns the distance. If no function is given, use euclidean distance.
        step_size (int):
            Indicating the number of steps to move forward each round.
        time_column (str or int):
            Column of X that contains time values.
        target_column (str or int):
            Column of X that contains target values.

    Returns:
        list:
            A list of tuples with (start timestamp, end timestamp, distance) of matched shapes.
    """
    if func == "euclidean":
        func = euclidean
    else:
        func = _pdtw

    if isinstance(X, np.ndarray):
        X = pd.DataFrame(X)

    X = X.sort_values(time_column).set_index(time_column)
    shape = X.loc[start_time:end_time].values

    worst_dist = -1
    # scale data between [0, 1]
    scaler = MinMaxScaler(feature_range=[0, 1])
    scaler.fit(X)
    shape = scaler.transform(shape).flatten()
    # shape = shape.flatten()

    window_size = shape.shape[0]
    matched = list()

    start = 0
    max_start = len(X) - window_size + 1

    previous, current, after = (np.inf, []), (np.inf, []), (np.inf, [])
    checkpoint = window_size

    while start < max_start:
        end = start + window_size

        x = np.array(X.iloc[start:end])
        x = scaler.transform(x).flatten()
        # x = x.flatten()
        dist = func(x, shape) / window_size  # normalized by number of data points
        # dist = func(x, shape)  # normalized by number of data points
        if (dist > worst_dist):
            worst_dist = dist
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

    return matched, worst_dist


if __name__ == '__main__':
    samples = 200
    f = 4

    t = np.arange(samples)
    x = np.sin(3 * np.pi * f * t / 100).reshape((-1, 1))

    noise = np.random.normal(0, 0.2, size=x.shape)
    x = x + noise

    window_size = 10
    i = np.random.choice(range(0, len(x) - window_size))

    X = pd.DataFrame({'timestamp': t, 'value': x.flatten()})

    candidate_shapes = return_candidate_shapes(X, i, i + window_size, 'dtw')
    print(candidate_shapes)
