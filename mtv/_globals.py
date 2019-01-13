import os
from datetime import datetime as dt

from mtv.utils.db import MongoDB
from mtv.utils.helper import setup_logging

# global variables
global app
global db
global logger


def setup_global(_app):
    # set flask app as global app
    app = _app

    # setup logger
    path_to_log = os.path.join(
        'logs', dt.now().strftime("%Y-%m-%d_%H.%M.%S") + '.log')
    setup_logging(path_to_log)

    # setup mongodb
    MongoDB(app.config)
