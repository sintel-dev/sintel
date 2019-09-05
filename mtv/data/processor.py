import logging
from calendar import monthrange
from datetime import datetime, timezone

LOGGER = logging.getLogger(__name__)


def to_mongo_docs(name, data, interval=30, utc=True):
    # check
    if (not (60 % interval == 0 or interval % 60 == 0)):
        print('60 should be divisible by interval.')
        return None

    day_bin_num = 24 * 60 // interval

    if (utc):
        year_start = datetime.utcfromtimestamp(data.index.values[0]).year
        year_end = datetime.utcfromtimestamp(data.index.values[-1]).year
    else:
        year_start = datetime.fromtimestamp(data.index.values[0]).year
        year_end = datetime.fromtimestamp(data.index.values[-1]).year

    docs = []
    """ init """
    for y in range(year_start, year_end + 1):

        if (utc):
            dt = datetime(y, 1, 1, tzinfo=timezone.utc)
        else:
            dt = datetime(y, 1, 1)

        docs.append({
            'dataset': name,
            'timestamp': dt.timestamp(),
            'year': dt.year,
            'data': [None for i in range(12)]
        })

        for m in range(1, 12 + 1):
            days = []
            for d in range(monthrange(y, m)[1]):
                days.append({'means': [], 'counts': []})
                for n in range(day_bin_num):
                    if (utc):
                        st = datetime(
                            y, m, d + 1, tzinfo=timezone.utc).timestamp() + n * interval * 60
                        ed = datetime(
                            y, m, d + 1, tzinfo=timezone.utc).timestamp() + (n + 1) * interval * 60
                    else:
                        st = datetime(
                            y, m, d + 1).timestamp() + n * interval * 60
                        ed = datetime(y, m, d + 1).timestamp() + \
                            (n + 1) * interval * 60
                    mean = data.value.loc[st:ed].mean()
                    count = data.value.loc[st:ed].count()
                    if (count == 0):
                        mean = 0
                    days[-1]['means'].append(float(mean))
                    days[-1]['counts'].append(int(count))

            docs[-1]['data'][m - 1] = days

    return docs
