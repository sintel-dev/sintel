import requests
import json
from datetime import datetime, timedelta

RECOURSE_URL = "http://lccpu6.cse.ust.hk/index.php/smartcity/api/Weather/report/"


def fetch_data(params=None):
    # params: {'paraName': 'paraData'}
    reply = requests.get(RECOURSE_URL, params=params)
    try:
        content = reply.json()
    except:
        raise ValueError()
    if content['errCode'] == '000000':
        return content['data']
    else:
        return None

def date_iterator(date_format, start, end, day_interval=1):
    start = datetime.strptime(start, date_format)
    end = datetime.strptime(end, date_format)
    current = start
    while current < end:
        yield current.strftime(date_format)
        current += timedelta(days=day_interval)
 
if __name__ == '__main__':
    # data = fetch_data({'date': '2018-11-27'})
    # print(data)
    time_format = '%Y-%m-%d'
    start = '2016-01-01'
    end = '2016-12-31'
    date_iter = date_iterator(time_format, start, end)

    cc = 0
    data = list()
    for date in date_iter:
        data.append(fetch_data({'date': date}))
        cc += 1
        if (cc % 30 == 0):
            print(date)
    
    with open('raw/air/2016.json', 'w') as outfile:  
        json.dump(data, outfile, indent=4)

    with open('raw/air/2016.json') as json_file:
        data = json.load(json_file)
        print(data)
