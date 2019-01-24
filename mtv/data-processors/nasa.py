import csv
import os

import numpy as np

# n = np.reshape([1,2,3,4,5,6], (2, 2))
# print(n)
# print(n.shape)


# train = np.load(os.path.join("data", "train", 'T-12' + ".npy"))
# print(train.shape)


def dump_to_csv(X, dest_file_path):
    ''' transform npy data to csv

    Args:
        data (numpy data):

    Returns:
    '''

    with open(dest_file_path, 'w', newline='') as f:

        # dict writer
        fieldnames = ['timestamp', 'value']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(X.shape[0]):
            v = X[i, 0]
            writer.writerow({'timestamp': i, 'value': v})

        # normal writer
        # writer = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        # for i in range(X.shape[0]):
        #     v = X[i, 0]
        #     writer.writerow([i, v])


def classify_files():
    classes = {}
    name_set = set([])
    with open('labeled_anomalies.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter=',')
        for row in csv_reader:
            # if line_count == 0:
            #     line_count += 1
            #     continue
            if row['spacecraft'] not in name_set:
                name_set.add(row['spacecraft'])
                classes[row['spacecraft']] = set()
            classes[row['spacecraft']].add(row['chan_id'])
            # line_count += 1
    return classes


if __name__ == "__main__":
    ori_folder_path = 'data/train'

    # test single file
    # path_to_file = 'data/train/A-1.npy'
    # data = np.load(path_to_file)
    # dump_to_csv(data, dest_folder_path + '/A-1.csv')
    classes = classify_files()

    # create directory for storing dumped data
    for cs in classes:
        if not os.path.isdir('data/csv_%s' % cs):
            os.mkdir('data/csv_%s' % cs)

    files = []
    for (dirpath, dirnames, filenames) in os.walk(ori_folder_path):
        for name in filenames:
            file_path = os.path.join(dirpath, name)
            data = np.load(file_path)
            dest_folder_path = 'data/csv_'
            for cs in classes:
                if name[:-4] in classes[cs]:
                    dest_folder_path += cs
                    break
            if (not dest_folder_path[-1] == '_'):
                dump_to_csv(data, os.path.join(dest_folder_path,
                                               name.replace('.npy', '.csv')))
            else:
                print(name)
