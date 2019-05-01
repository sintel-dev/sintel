import json
import logging
from mtv.data.air_station_names import name_map, plt_station_name_set
from datetime import datetime, timedelta
import csv

LOGGER = logging.getLogger(__name__)

def init_stations():
    station_info = {}
    for name in plt_station_name_set:
        station_info[name] = {
            'temperature': [],
            'humidity': [],
            'pressure': [],
            'windSpeed': [],
            'windDirection': [],
            "NO2": [],
            "O3": [],
            "SO2": [],
            "CO": [],
            "PM10": [],
            "PM2.5": [],
            "AQHI": [],
            "healthRisk": []
        }
    return station_info

def add_pollutant_info(stations, plt_data):
    flat_plt_data = list()
    for plt_item in plt_data:
        if not plt_item['monitor']['errCode'] == '000000':
            continue
        flat_plt_data.extend(plt_item['monitor']['data'])

    time_format = '%Y-%m-%d %H:%M:%S'
    for d in flat_plt_data:
        name = d['stationName']
        t = datetime.strptime(d['dateTime'], time_format).timestamp()
        if (not d['NO2'] == -1):
            stations[name]["NO2"].append([t, d['NO2']])
        if (not d['O3'] == -1):
            stations[name]["O3"].append([t, d['O3']])
        if (not d['SO2'] == -1):
            stations[name]["SO2"].append([t, d['SO2']])
        if (not d['CO'] == -1):
            stations[name]["CO"].append([t, d['CO']])
        if (not d['PM10'] == -1):
            stations[name]["PM10"].append([t, d['PM10']])
        if (not d['PM2.5'] == -1):
            stations[name]["PM2.5"].append([t, d['PM2.5']])
        if (not d['AQHI'] == -1):
            stations[name]["AQHI"].append([t, d['AQHI']])
        if (not d['healthRisk'] == -1):
            stations[name]["healthRisk"].append([t, d['healthRisk']])

    # AQHI -- healthRisk
    # Low	1-3
    # Moderate 4-6
    # High 7-10
    # Very high > 10

def add_weather_info(stations, wth_data):
    temperature_data = list()
    humidity_data = list()
    pressure_data = list()
    wind_data = list()
    for wth_item in wth_data:
        if wth_item['temperature']['errCode'] == '000000':
            temperature_data.extend(wth_item['temperature']['data'])
        if wth_item['humidity']['errCode'] == '000000':
            humidity_data.extend(wth_item['humidity']['data'])
        if wth_item['pressure']['errCode'] == '000000':
            pressure_data.extend(wth_item['pressure']['data'])
        if wth_item['wind']['errCode'] == '000000':
            wind_data.extend(wth_item['wind']['data'])

    time_format = '%Y-%m-%d %H:%M:%S'
    
    # temperature
    for d in temperature_data:
        t = datetime.strptime(d['updateTime'], time_format).timestamp()
        d.pop('updateTime')
        for k in d:
            for nm in name_map['temperature'][k]:
                if not d[k] is None:
                    stations[nm]['temperature'].append([t, d[k]])

    # humidity
    for d in humidity_data:
        t = datetime.strptime(d['updateTime'], time_format).timestamp()
        for nm in name_map['humidity'][d['place']]:
            if not d['humidity'] == 0:
                stations[nm]['humidity'].append([t, d['humidity']])
    
    # pressure
    for d in pressure_data:
        t = datetime.strptime(d['updateTime'], time_format).timestamp()
        for nm in name_map['pressure'][d['place']]:
            if not d['pressure'] == 0:
                stations[nm]['pressure'].append([t, d['pressure']])

    # wind & wind_direction
    DIRECTION_MAP = {
        "N/A": 0,
        "North": 1,
        "Northeast": 2,
        "East": 3,
        "Southeast": 4,
        "South": 5,
        "Southwest": 6,
        "West": 7,
        "Northwest": 8,
        "Calm": 9,
        "Variable": 10
    }
    for d in wind_data:
        t = datetime.strptime(d['updateTime'], time_format).timestamp()
        # if not d['direction'] in DIRECTION_MAP:
        #     print(d)
        for nm in name_map['wind'][d['place']]:
            if (not d['speed'] == -1) or (not d['speed'] == 0):
                stations[nm]['windSpeed'].append([t, d['speed']])
            if (d['direction'] in DIRECTION_MAP):
                stations[nm]['windDirection'].append([t, DIRECTION_MAP[d['direction']]])

def dump_to_csv(stations):
    for name in stations:
        for idx_name in stations[name]:
            stations[name][idx_name].sort(key=lambda x: x[0])
            modified_name = name.replace("/", " ")
            with open('./mtv/data/raw/hkair/{}_{}.csv'.format(modified_name, idx_name), 'w', newline='') as f:
                fieldnames = ['timestamp', 'value']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for d in stations[name][idx_name]:
                    writer.writerow({'timestamp': d[0], 'value': d[1]})

def main():

    wth_data = list()   # weather data
    plt_data = list()   # pollutant data

    for yr in ['2016', '2017', '2018', '2019']:

        with open('mtv/data/raw/air/{}.json'.format(yr)) as air_json_file:
            wth_data.extend(json.load(air_json_file))

        with open('mtv/data/raw/env/{}.json'.format(yr)) as env_json_file:
            plt_data.extend(json.load(env_json_file))

    # init stations
    stations = init_stations()

    # filter all empty item
    plt_data = [d for d in plt_data if d is not None]
    wth_data = [d for d in wth_data if d is not None]
    
    add_pollutant_info(stations, plt_data)
    add_weather_info(stations, wth_data)

    dump_to_csv(stations)