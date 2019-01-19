import logging
import os
import sys


def is_string(o):
    return isinstance(o, str)


def is_list(o):
    return isinstance(o, list)


def create_dirs(path_to_dir):
    '''Create directories if they don't already exist

    Args:
        path_to_dir(string or string[]): self-explanatory.
    '''

    if is_string(path_to_dir):
        if not os.path.isdir(path_to_dir):
            os.mkdir(path_to_dir)
    elif is_list(path_to_dir):
        for p in path_to_dir:
            if not os.path.isdir(p):
                os.mkdir(p)
    else:
        raise TypeError("the argument 'path_to_dir' \
         should be a string or a list of strings")


def get_dirs(dir):
    return [name for name in os.listdir(dir)
            if os.path.isdir(os.path.join(dir, name))]


def get_files(dir):
    result = []
    for (root, dirs, files) in os.walk(dir):
        result.extend(files)
    return result


def setup_logging(path_to_log):
    '''Configure logging object...

    Args:
        path_to_log(string): self-explanatory.

    Returns:
        logger (obj): Logging object
    '''

    create_dirs(os.path.dirname(path_to_log))

    logger = logging.getLogger('mtv')
    hdlr = logging.FileHandler(path_to_log)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    hdlr.setFormatter(formatter)
    logger.addHandler(hdlr)
    logger.setLevel(logging.INFO)

    stdout = logging.StreamHandler(sys.stdout)
    stdout.setLevel(logging.INFO)
    logger.addHandler(stdout)

    logger.info("Start:")
    logger.info("----------------")

    return logger
