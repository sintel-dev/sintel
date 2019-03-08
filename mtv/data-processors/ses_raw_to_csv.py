import os


def get_files(dir):
    result = []
    for (root, dirs, files) in os.walk(dir):
        result.extend(files)
    return result


if __name__ == "__main__":

    work_dir = os.getcwd()

    ori_folder_path = r'{}\client\public\data\SES'.format(work_dir)

    files = get_files(ori_folder_path)

    # rename
    for file in files:
        path_to_file = os.path.join(ori_folder_path, file)
        if file.endswith('.csv'):
            os.remove(path_to_file)
        if file.endswith('.csv_'):
            os.rename(path_to_file, path_to_file[:-1])

    # remove first column
    # for file in files:
    #     path_to_file = os.path.join(ori_folder_path, file)

    #     with open(path_to_file, 'r') as csv_file:
    #         csv_reader = csv.reader(csv_file, delimiter=',')
    #         with open(path_to_file + '_', 'w', newline='') as f:
    #             # dict writer
    #             fieldnames = ['timestamp', 'value']
    #             writer = csv.DictWriter(f, fieldnames=fieldnames)
    #             writer.writeheader()

    #             line_count = 0
    #             for row in csv_reader:
    #                 if line_count == 0:
    #                     line_count += 1
    #                     continue
    #                 writer.writerow({'timestamp': row[1], 'value': row[2]})
    #                 line_count += 1
