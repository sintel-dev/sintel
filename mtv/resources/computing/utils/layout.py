import numpy as np
from mongoengine import connect
from sklearn.manifold import TSNE

from mtv.db import schema
from mtv.resources.computing.utils.signal_distance import event_overlap_distance

if __name__ == '__main__':

    db = connect('mtv', host='localhost', port=27017)

    signalrun_docs = schema.Signalrun.find()
    event_list = list()
    count = 0
    for signalrun_doc in signalrun_docs:
        event_docs = schema.Event.find(signalrun=signalrun_doc)
        events = [(doc.start_time, doc.stop_time) for doc in event_docs]
        event_list.append({
            'eid': count,
            'events': events,
            'start': signalrun_doc.signal.start_time,
            'end': signalrun_doc.signal.stop_time
        })
        count += 1

    dist_matrix = np.empty((count, count))

    for i in range(count):
        for j in range(i + 1):
            if i == j:
                dist_matrix[i, j] = 0
            else:
                dist_matrix[i, j] = event_overlap_distance(
                    event_list[i]['events'],
                    event_list[j]['events'],
                    min(event_list[i]['start'], event_list[j]['start']),
                    max(event_list[i]['end'], event_list[j]['end'])
                )
                dist_matrix[j, i] = dist_matrix[i, j]

    def func_dist(a, b):
        return dist_matrix[int(a[0]), int(b[0])]

    X = np.arange(count)
    X = X.reshape(-1, 1).astype(int)

    X_embedded = TSNE(n_components=1, metric=func_dist).fit_transform(X)
    print(X_embedded)
