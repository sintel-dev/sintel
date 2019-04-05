import json
import logging
from datetime import datetime, timedelta

LOGGER = logging.getLogger(__name__)

ENV_STATIONS = ['Tung Chung', 'Tuen Mun', 'Tseung Kwan O', 'Mong Kok',
                'Central/Western', 'Yuen Long', 'Sham Shui Po', 'Kwai Chung',
                'Causeway Bay', 'Sha Tin', 'Kwun Tong', 'Eastern',
                'Tsuen Wan', 'Central', 'Tap Mun', 'Tai Po']

STATIONS = ["ChekLapKok", "CheungChau", "HappyValley", "HongKongObser",
            "HongKongPark", "KaiTakRunw", "KingsPark", "KowloonCi", "KwunTong",
            "LauFauSh", "SaiKung", "ShaTin", "ShamShuiPo"  "ShauKeiWa",
            "ShekKong", "TaKwuL", "TaiPo", "TseungKw", "TsingYi",
            "TsuenWanHoKoon", "TsuenWan", "TuenMun", "WongChukHan",
            "WongTaiSin", "YuenLongPark"]

DirectionMap = {
    "North": 0,
    "Northeast": 1,
    "East": 2,
    "Southeast": 3,
    "South": 4,
    "Southwest": 5,
    "West": 6,
    "Northwest": 7
}


# Low	1-3
# Moderate 4-6
# High 7-10
# Very high > 10

# temperature
# humidity
# pressure
# wind
# wind_direction

def init_station_info():
    station_info = {}
    for name in STATIONS:
        station_info[name] = {
            'temperature': [],
            'humidity': [],
            'pressure': [],
            'wind_speed': [],
            'wind_direction': [],
            'pollutant': {
                "NO2": [],
                "O3": [],
                "SO2": [],
                "CO": [],
                "PM10": [],
                "PM2.5": [],
                "AQHI": [],
                "healthRisk": []
            }
        }
    return station_info


def extend_air_info_by_station(station_info, data):
    for d in data:
        temp = d.get('temperature', None)
        if (temp is not None and temp['errCode'] == '000000'):
            temp = temp['data']
            update_time = datetime.strptime(temp['updateTime'],
                                            '%Y-%m-%d %H:%M:%S')
            update_time.timestamp()

        humidity = d.get('humidity', None)
        pressure = d.get('pressure', None)
        wind = d.get('wind', None)

def extend_env_info(station_info, data):
    fmt = '%Y-%m-%d %H:%M:%S'
    station_name_set = set()
    for dm in data:
        if (dm is None):
            continue
        if (not dm['monitor']['errCode'] == '000000'):
            continue
        for d in dm['monitor']['data']:
            dt = datetime.strptime(d['dateTime'], fmt)
            station_name_set.add(d['stationName'])
            station_info[d['stationName']]['NO2'].append([dt.timestamp(), d['NO2']])
            station_info[d['stationName']]['O3'].append([dt.timestamp(), d['O3']])
            station_info[d['stationName']]['SO2'].append([dt.timestamp(), d['SO2']])
            station_info[d['stationName']]['CO'].append([dt.timestamp(), d['CO']])
            station_info[d['stationName']]['PM10'].append([dt.timestamp(), d['PM10']])
            station_info[d['stationName']]['PM2.5'].append([dt.timestamp(), d['PM2.5']])
            station_info[d['stationName']]['CO'].append([dt.timestamp(), d['CO']])
            station_info[d['stationName']]['AQHI'].append([dt.timestamp(), d['AQHI']])
            station_info[d['stationName']]['healthRisk'].append([dt.timestamp(), d['healthRisk']])

    print(station_name_set)

def main():
    air_data = list()
    env_data = list()

    for yr in ['2016', '2017', '2018', '2019']:

        with open('mtv/data/raw/air/{}.json'.format(yr)) as air_json_file:
            air_data.extend(json.load(air_json_file))

        with open('mtv/data/raw/env/{}.json'.format(yr)) as env_json_file:
            env_data.extend(json.load(env_json_file))

    air_data = [d for d in air_data if d is not None]
    env_data = [d for d in env_data if d is not None]

    station_info = init_station_info()
    stations = extend_env_info(station_info, env_data)
