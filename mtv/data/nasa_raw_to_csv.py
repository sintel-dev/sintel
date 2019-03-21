import csv
import os

import numpy as np


def dump_to_csv(X, dest_file_path):
    ''' transform npy data to csv

    Args:
        data (numpy data):

    Returns:
    '''

    with open(dest_file_path, 'w', newline='') as f:
        fieldnames = ['timestamp', 'value']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(X.shape[0]):
            v = X[i, 0]
            # faked timestamp starting from
            # Wednesday, October 1, 2008 12:00:00 AM （GMT）
            # with interval 21600s, namely 6 hours
            writer.writerow({'timestamp': 1222819200 + i * 21600, 'value': v})


def classify_files(dir):
    classes = {}
    name_set = set([])
    with open(os.path.join(dir, 'labeled_anomalies.csv'), mode='r') as file:
        csv_reader = csv.DictReader(file, delimiter=',')
        for row in csv_reader:
            if row['spacecraft'] not in name_set:
                name_set.add(row['spacecraft'])
                classes[row['spacecraft']] = set()
            classes[row['spacecraft']].add(row['chan_id'])

    return classes


if __name__ == "__main__":

    # test single file
    # path_to_file = 'data/train/A-1.npy'
    # data = np.load(path_to_file)
    # dump_to_csv(data, dest_folder_path + '/A-1.csv')

    # nasa dataset contains two different sub-datasets
    classes = classify_files('raw-data/nasa/')
    for cs in classes:
        if not os.path.isdir('raw-data/nasa/{}'.format(cs)):
            os.mkdir('raw-data/nasa/{}'.format(cs))

    data_dir = 'raw-data/nasa/raw'

    # process every file
    files = []
    for (dirpath, dirnames, filenames) in os.walk(data_dir):
        for name in filenames:
            file_path = os.path.join(dirpath, name)
            data = np.load(file_path)
            dest_folder_path = 'raw-data/nasa/'
            found = False
            for cs in classes:
                if name[:-4] in classes[cs]:
                    dest_folder_path += cs
                    found = True
                    break
            if (found):
                dump_to_csv(data, os.path.join(dest_folder_path,
                                               name.replace('.npy', '.csv')))
            else:
                print('error when processing signal {}'.format(name))
