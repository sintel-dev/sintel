plt_station_name_set = {
    'Sham Shui Po', 'Eastern', 'Tsuen Wan', 'Central',
    'Kwun Tong', 'Mong Kok', 'Kwai Chung', 'Central/Western',
    'Tap Mun', 'Sha Tin', 'Tai Po', 'Causeway Bay',
    'Yuen Long', 'Tseung Kwan O', 'Tuen Mun', 'Tung Chung'
}
temperature_name_set = {
    'TaKwuLing', 'ShauKeiWan', 'ShaTin', 'HappyValley',
    'KowloonCity', 'TseungKwanO', 'LauFauShan', 'ChekLapKok',
    'TaiPo', 'ShekKong', 'HongKongObservatory', 'ShamShuiPo',
    'KwunTong', 'KingsPark', 'HongKongPark', 'WongTaiSin',
    'TsuenWanHoKoon', 'KaiTakRunwayPark', 'SaiKung', 'CheungChau',
    'WongChukHang', 'TuenMun', 'TsuenWanShingMunValley', 'TsingYi',
    'YuenLongPark'}
humidity_name_set = {
    'Wetland_Park', 'Cheung_Chau', 'Peng_Chau', 'Ta_Kwu_Ling',
    'Kowloon_City', 'Tsuen_Wan_Shing_Mun_Valley', 'Wong_Chuk_Hang',
    'Stanley', 'Tseung_Kwan_O', 'Ngong_Ping', 'Shek_Kong',
    'Sham_Shui_Po', 'Tuen_Mun', 'Happy_Valley', 'Tsing_Yi',
    'Wong_Tai_Sin', 'Shau_Kei_Wan', 'The_Peak', 'Kwun_Tong',
    'Tai_Mo_Shan', 'Tates_Cairn', 'Kau_Sai_Chau', 'Waglan_Island',
    'Sheung_Shui', 'HK_Observatory', 'Tai_Po', 'Yuen_Long_Park',
    'Sai_Kung', 'Chek_Lap_Kok', 'HK_Park', 'Kings_Park',
    'Tsuen_Wan_Ho_Koon', 'Pak_Tam_Chung', 'Lau_Fau_Shan', 'Sha_Tin'
}
pressure_name_set = {
    'Wetland_Park', 'Chek_Lap_Kok', 'Shek_Kong', 'Cheung_Chau',
    'Tai_Po', 'Peng_Chau', 'Ta_Kwu_Ling', 'Waglan_Island',
    'Sheung_Shui', 'Lau_Fau_Shan', 'Sha_Tin', 'HK_Observatory'
}
wind_name_set = {
    'Wetland_Park', 'Cheung_Chau_Beach', 'Cheung_Chau', 'Tai_Mei_Tuk',
    'Peng_Chau', 'Tai_Po_Kau', 'Ta_Kwu_Ling', 'Wong_Chuk_Hang',
    'Stanley', 'Sha_Chau', 'Tseung_Kwan_O', 'Ngong_Ping',
    'Shek_Kong', 'Green_Island', 'Tuen_Mun', 'Tsing_Yi',
    'Tates_Cairn', 'Tap_Mun', 'Waglan_Island', 'Kai_Tak',
    'Sai_Kung', 'Chek_Lap_Kok', 'Kings_Park', 'Star_Ferry',
    'Lau_Fau_Shan', 'Sha_Tin'
}

name_map = {
    'temperature': {
        'TaKwuLing': [],
        'ShauKeiWan': [],
        'ShaTin': [],
        'HappyValley': [],
        'KowloonCity': [],
        'TseungKwanO': [],
        'LauFauShan': [],
        'ChekLapKok': [],
        'TaiPo': [],
        'ShekKong': [],
        'HongKongObservatory': [
            'Sham Shui Po', 'Eastern', 'Tsuen Wan', 'Central',
            'Kwun Tong', 'Mong Kok', 'Kwai Chung', 'Central/Western',
            'Tap Mun', 'Sha Tin', 'Tai Po', 'Causeway Bay',
            'Yuen Long', 'Tseung Kwan O', 'Tuen Mun', 'Tung Chung'
        ],
        'ShamShuiPo': [],
        'KwunTong': [],
        'KingsPark': [],
        'HongKongPark': [],
        'WongTaiSin': [],
        'TsuenWanHoKoon': [],
        'KaiTakRunwayPark': [],
        'SaiKung': [],
        'CheungChau': [],
        'WongChukHang': [],
        'TuenMun': [],
        'TsuenWanShingMunValley': [],
        'TsingYi': [],
        'YuenLongPark': []
    },
    'humidity': {
        'Wetland_Park': [],
        'Cheung_Chau': [],
        'Peng_Chau': [],
        'Ta_Kwu_Ling': [],
        'Kowloon_City': [],
        'Tsuen_Wan_Shing_Mun_Valley': [],
        'Wong_Chuk_Hang': [],
        'Stanley': [],
        'Tseung_Kwan_O': [],
        'Ngong_Ping': [],
        'Shek_Kong': [],
        'Sham_Shui_Po': [],
        'Tuen_Mun': [],
        'Happy_Valley': [],
        'Tsing_Yi': [],
        'Wong_Tai_Sin': [],
        'Shau_Kei_Wan': [],
        'The_Peak': [],
        'Kwun_Tong': [],
        'Tai_Mo_Shan': [],
        'Tates_Cairn': [],
        'Kau_Sai_Chau': [],
        'Waglan_Island': [],
        'Sheung_Shui': [],
        'HK_Observatory': [
            'Sham Shui Po', 'Eastern', 'Tsuen Wan', 'Central',
            'Kwun Tong', 'Mong Kok', 'Kwai Chung', 'Central/Western',
            'Tap Mun', 'Sha Tin', 'Tai Po', 'Causeway Bay',
            'Yuen Long', 'Tseung Kwan O', 'Tuen Mun', 'Tung Chung'
        ],
        'Tai_Po': [],
        'Yuen_Long_Park': [],
        'Sai_Kung': [],
        'Chek_Lap_Kok': [],
        'HK_Park': [],
        'Kings_Park': [],
        'Tsuen_Wan_Ho_Koon': [],
        'Pak_Tam_Chung': [],
        'Lau_Fau_Shan': [],
        'Sha_Tin': []
    },
    'pressure': {
        'Wetland_Park': [],
        'Chek_Lap_Kok': [],
        'Shek_Kong': [],
        'Cheung_Chau': [],
        'Tai_Po': [],
        'Peng_Chau': [],
        'Ta_Kwu_Ling': [],
        'Waglan_Island': [],
        'Sheung_Shui': [], 
        'Lau_Fau_Shan': [],
        'Sha_Tin': [],
        'HK_Observatory': [
            'Sham Shui Po', 'Eastern', 'Tsuen Wan', 'Central',
            'Kwun Tong', 'Mong Kok', 'Kwai Chung', 'Central/Western',
            'Tap Mun', 'Sha Tin', 'Tai Po', 'Causeway Bay',
            'Yuen Long', 'Tseung Kwan O', 'Tuen Mun', 'Tung Chung'
        ]
    },
    # 'pressure': {
    #     'Wetland_Park': ['Yuen Long'],
    #     'Chek_Lap_Kok': ['Tung Chung'],
    #     'Shek_Kong': [],
    #     'Cheung_Chau': [],
    #     'Tai_Po': ['Tai Po'],
    #     'Peng_Chau': [],
    #     'Ta_Kwu_Ling': [],
    #     'Waglan_Island': [],
    #     'Sheung_Shui': [], 
    #     'Lau_Fau_Shan': ['Tuen Mun'],
    #     'Sha_Tin': ['Sha Tin', 'Kwai Chung', 'Tsuen Wan'],
    #     'HK_Observatory': [
    #         'Sham Shui Po', 'Kwun Tong', 'Causeway Bay', 'Mong Kok',
    #         'Central/Western', 'Central', 'Eastern', 'Tseung Kwan O'
    #     ]
    # },
    'wind': {
        'Wetland_Park': ['Yuen Long'],
        'Cheung_Chau_Beach': [],
        'Cheung_Chau': [],
        'Tai_Mei_Tuk': [],
        'Peng_Chau': [],
        'Tai_Po_Kau': ['Tai Po'],
        'Ta_Kwu_Ling': [],
        'Wong_Chuk_Hang': [],
        'Stanley': [],
        'Sha_Chau': [],
        'Tseung_Kwan_O': ['Tseung Kwan O'],
        'Ngong_Ping': [],
        'Shek_Kong': [],
        'Green_Island': [],
        'Tuen_Mun': ['Tuen Mun'],
        'Tsing_Yi': ['Kwai Chung', 'Tsuen Wan'],
        'Tates_Cairn': [],
        'Tap_Mun': ['Tap Mun'],
        'Waglan_Island': [],
        'Kai_Tak': [],
        'Sai_Kung': [],
        'Chek_Lap_Kok': ['Tung Chung'],
        'Kings_Park': [],
        'Star_Ferry': ['Sham Shui Po', 'Eastern', 'Kwun Tong', 'Central', 'Central/Western', 'Mong Kok', 'Causeway Bay'],
        'Lau_Fau_Shan': [],
        'Sha_Tin': ['Sha Tin']
    }
    
}