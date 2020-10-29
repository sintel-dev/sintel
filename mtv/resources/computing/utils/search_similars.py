
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


def _overlap(expected, observed):
    first = expected[0] - observed[1]
    second = expected[1] - observed[0]
    if first * second < 0:
        return observed

    return False


def _any_overlap(part, intervals):
    for interval in intervals:
        flag = _overlap(part, interval)
        if flag:
            return flag

    return False


def _segment_timeseries(X, events):
    edges = set()
    for event in events:
        edges.update(event)

    start = X.index.min()
    end = X.index.max()

    edges.add(start)
    edges.add(end)

    segments = list()
    edges = sorted(edges)

    index = 0
    while index < len(edges) - 1:
        start = edges[index]
        end = edges[index + 1]
        segments.append(X.loc[start: end])
        index += 2

    return segments


def _add_shape(X, matched, shape):
    idx_start = X.index[shape[1][0]]
    idx_end = X.index[shape[1][-1]]
    matched.append((idx_start, idx_end, shape[0]))


def _check_edges(X, matched, state):
    state = sorted(state, key=lambda x: x[0])
    pre = set()
    for sh in state:
        if sh[1] and not pre.intersection(sh[1]):
            _add_shape(X, matched, sh)
        pre = set(sh[1])


def _return_candidate_shapes(X, shape, func, step_size):
    worst_dist = -1

    window_size = shape.shape[0]
    matched = list()

    start = 0
    max_start = len(X) - window_size + 1

    previous, current, after = (np.inf, []), (np.inf, []), (np.inf, [])
    checkpoint = window_size

    while start < max_start:
        end = start + window_size

        x = X.iloc[start:end]
        x = np.array(x).flatten()

        dist = func(x, shape) / window_size  # normalized by number of data points
        if (dist > worst_dist):
            worst_dist = dist

        if dist < after[0]:
            after = (dist, range(start, end))

        if start > checkpoint:
            # time range
            prevset = set(previous[1])
            aftset = set(after[1])

            # overlap
            if prevset.intersection(current[1]):
                if current[0] > previous[0]:
                    # add previous
                    _add_shape(X, matched, previous)
                    current = (np.inf, [])

                elif aftset.intersection(current[1]) and after[0] < current[0]:
                    # add previous
                    _add_shape(X, matched, previous)
                    current = (np.inf, [])

            # no overlap
            elif previous[1]:
                # add previous
                _add_shape(X, matched, previous)

            previous = current
            current = after
            after = (np.inf, [])

            checkpoint = checkpoint + window_size

        start = start + step_size

    _check_edges(X, matched, (previous, current, after))

    return matched, worst_dist


def return_candidate_shapes(X, start_time, end_time, func='euclidean', step_size=1,
                            time_column='timestamp', target_column='value', events=[]):
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
        events (list):
            A list of tuples with (start timestamp, end timestamp,) of existing events.

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
    scaler = MinMaxScaler(feature_range=[0, 1])
    X.loc[:] = scaler.fit_transform(X.values.reshape(-1, 1))

    shape = X.loc[start_time:end_time].values
    shape = shape.flatten()

    segments = _segment_timeseries(X, events)

    worst = -1
    candidates = list()
    for seg in segments:
        matched, worst_dist = _return_candidate_shapes(seg, shape, func, step_size)
        candidates.extend(matched)

        if worst < worst_dist:
            worst = worst_dist

    return candidates, worst


if __name__ == '__main__':
    samples = 200
    f = 4

    s = 100
    t = np.arange(s, s + samples)
    x = np.sin(3 * np.pi * f * t / 100).reshape((-1, 1))

    noise = np.random.normal(0, 0.2, size=x.shape)
    x = x + noise

    window_size = 10
    i = np.random.choice(range(s, s + len(x) - window_size))

    X = pd.DataFrame({'timestamp': t, 'value': x.flatten()})
    events = [(120, 140)]

    candidate_shapes, worst_dist = return_candidate_shapes(
        X, i, i + window_size, 'dtw', events=events)
    print(candidate_shapes)
