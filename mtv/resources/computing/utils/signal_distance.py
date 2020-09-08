import numpy as np
from pyts.metrics import dtw as pdtw
from scipy.spatial.distance import euclidean
from sklearn.preprocessing import MinMaxScaler


def _pdtw(x, shape):
    return pdtw(x, shape, method="itakura", options={"max_slope": 1.5})


def _overlap(ts1, ts2):
    first = ts1[0] - ts2[1]
    second = ts1[1] - ts2[0]
    return first * second < 0


def _any_overlap(part, intervals):
    for interval in intervals:
        if _overlap(part, interval):
            return 1

    return 0


def _partition(ts1, ts2, start=None, end=None):
    edges = set()

    if start is not None:
        edges.add(start)

    if end is not None:
        edges.add(end)

    for edge in ts1 + ts2:
        edges.update(edge)

    partitions = list()
    edges = sorted(edges)
    last = edges[0]
    for edge in edges[1:]:
        partitions.append((last, edge))
        last = edge

    ts1_parts = list()
    ts2_parts = list()
    weights = list()
    for part in partitions:
        weights.append(part[1] - part[0])
        ts1_parts.append(_any_overlap(part, ts1))
        ts2_parts.append(_any_overlap(part, ts2))

    return ts1_parts, ts2_parts, weights


def timeseries_distance(ts1, ts2, metric="euclidean"):
    """ Compute the distance between two time series based on values

    Args:
        ts1 (list):
            A list of tuples (start_timestamp, end_timestamp) of existing events
            from time series A
        ts2 (list):
            A list of tuples (start_timestamp, end_timestamp) of existing events
            from time series B
        metric (string):
            Distance metric. Must be one of ['euclidean', 'dtw']

    Returns:
        float:
            the distance
    """
    switcher = {
        'euclidean': euclidean,
        'dtw': pdtw
    }
    dist_func = switcher.get(metric, None)
    if dist_func is None:
        raise Exception('Wrong distance metric is given')

    scaler = MinMaxScaler(feature_range=(0, 1))

    ts1 = np.asarray(ts1).reshape(-1, 1)
    ts2 = np.asarray(ts2).reshape(-1, 1)

    ts1 = scaler.fit_transform(ts1).flatten()
    ts2 = scaler.fit_transform(ts2).flatten()

    # normalized by number of data points
    return dist_func(ts1, ts2) / ts1.shape[0]


def event_overlap_distance(events1, events2, start, end):
    """ Compute the distance between two time series based on event overlap

    Overlap Coefficient is used: |A ∩ B| / min(|A|,|B|)

    Args:
        events1 (list):
            A list of tuples (start_timestamp, end_timestamp) of existing events
            from time series A
        events2 (list):
            A list of tuples (start_timestamp, end_timestamp) of existing events
            from time series B
        start (int):
            Minimum (the ealiest) timestamp for both time series
        end (int):
            Maximum (the latest) timestamp for both time series

    Returns:
        float:
            the distance
    """
    s1, s2, weights = _partition(events1, events2, start, end)

    s1_length = 0
    s2_length = 0
    overlap_length = 0
    for i in range(len(s1)):
        if s1[i] and s2[i]:
            overlap_length += weights[i]
        s1_length += s1[i] * weights[i]
        s2_length += s2[i] * weights[i]

    denominator = min(s1_length, s2_length)

    if denominator == 0:
        return 1
    else:
        return 1 - overlap_length / denominator


def _point_partition(expected, observed, start=None, end=None):
    expected = set(expected)
    observed = set(observed)

    edge_start = min(expected.union(observed))
    if start is not None:
        edge_start = start

    edge_end = max(expected.union(observed))
    if end is not None:
        edge_end = end

    length = int(edge_end) - int(edge_start) + 1

    expected_parts = [0] * length
    observed_parts = [0] * length

    for edge in expected:
        expected_parts[edge - edge_start] = 1

    for edge in observed:
        observed_parts[edge - edge_start] = 1

    return expected_parts, observed_parts, None


if __name__ == '__main__':
    ts1 = np.random.rand(10)
    ts2 = np.random.rand(10)

    print(timeseries_distance(ts1, ts2, 'dtw'))

    print(event_overlap_distance([(10, 20)], [(15, 30)], 0, 50))

    a1, a2, a3 = _point_partition([2, 5, 7], [5, 7, 10], 0, 15)
    print(a1)
    print(a2)
