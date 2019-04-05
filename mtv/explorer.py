import logging
import os
import sys
import numpy as np

from datetime import datetime
from flask import Flask
from flask_cors import CORS
from gevent.wsgi import WSGIServer
from mongoengine import connect
from termcolor import colored

from mtv.data.db import MongoDB
from mtv.data.processor import load_csv, to_mongo_raw
from mtv.routes import add_routes
from mtv.utils import import_object, get_files

LOGGER = logging.getLogger(__name__)

class MTVExplorer:

    def __init__(self, cf):
        self._cf = cf.copy()

        self._db = connect(db=cf['db'], host=cf['host'], port=cf['port'],
                           username=cf['username'], password=cf['password'])

    def _init_flask_app(self, env):
        app = Flask(
            __name__,
            static_url_path='',
            static_folder='../client',
            template_folder='../client'
        )

        app.config.from_mapping(**self._cf)

        if env == 'production':
            app.config.from_mapping(DEBUG=False, TESTING=False)

        elif env == 'development':
            app.config.from_mapping(DEBUG=True, TESTING=True)

        elif env == 'test':
            app.config.from_mapping(DEBUG=False, TESTING=True)

        CORS(app)

        add_routes(app)

        return app

    def run_server(self, env, port):

        env = self._cf['ENV'] if env is None else env
        port = self._cf['server_port'] if port is None else port

        # env validation
        if env not in ['development', 'production', 'test']:
            LOGGER.exception("env '%s' is not in "
                             "['development', 'production', 'test']", env)
            raise ValueError

        # just in case running app with the absolute path
        sys.path.append(os.path.dirname(__file__))

        app = self._init_flask_app(env)

        def http_server():
            LOGGER.info(colored('Starting up FLASK APP in {} mode'.format(env),
                                'yellow'))

            LOGGER.info(colored('Available on:', 'yellow') +
                        '  http://0.0.0.0:' + colored(port, 'green'))

            if env == 'development':
                debug = import_object('werkzeug.debug.DebuggedApplication')
                server = WSGIServer(('0.0.0.0', port), debug(app))

            elif env == 'production':
                server = WSGIServer(('0.0.0.0', port), app, log=None)

            server.serve_forever()

        if env == 'development':
            reloader = import_object('werkzeug.serving.run_with_reloader')
            reloader(http_server)

        elif env == 'production':
            http_server()

    def run_module(self, module, args):
        try:
            func_object = module + '.main'
            func = import_object(func_object)
            func(*args)
        except Exception as e:
            LOGGER.exception("Error running the module '{}': {}"
                             .format(module, str(e)))
    

    def add_datasets(self, path, start, stop, time_column, value_column, header):
        conn = MongoDB(address=self._cf['host'], port=self._cf['port'],
                       db=self._cf['db'])
        
        if not os.path.exists(path):
            LOGGER.exception('Data folder path "{}" does not exist'
                            .format(path))
            raise

        files = get_files(path)
        docs = []
        count = 0
        for file in files:
            file_path = os.path.join(path, file)
            count += 1
            LOGGER.info('{}/{}: Processing {}'.format(count, len(files), file))

            data = load_csv(file_path, None, None, time_column,
                            value_column, header)

            dt = np.array(data)
            time_min = np.amin(dt, axis=0)[0]
            time_max = np.amax(dt, axis=0)[0]

            docs.append({
                'insert_time': datetime.utcnow(),
                'name': file[0:-4],
                'signal_set': file[0:-4],
                'start_time': int(start if start else time_min),
                'stop_time': int(stop if stop else time_max),
                'data_location': os.path.abspath(file_path),
                'timestamp_column': time_column,
                'value_column': value_column,
                'created_by': 'dy'
            })
        
        conn.writeCollection(docs, 'dataset')


    def add_rawdata(self, path, col, start, stop, time_column,
                    value_column, header, interval):
        LOGGER.debug("time_column: {}, value_columne: {}, header: {}"
                     .format(time_column, value_column, header))

        conn = MongoDB(address=self._cf['host'], port=self._cf['port'],
                       db=self._cf['db'])

        if not os.path.exists(path):
            LOGGER.exception('Data folder path "{}" does not exist'
                            .format(path))
            raise

        files = get_files(path)

        count = 0
        for file in files:
            file_path = os.path.join(path, file)
            count += 1
            LOGGER.info('{}/{}: Processing {}'.format(count, len(files), file))

            data = load_csv(file_path, start, stop, time_column,
                            value_column, header)
            LOGGER.info('Loading over')

            docs = to_mongo_raw(file[0:-4], data)
            LOGGER.info('Transforming over')

            if docs:
                conn.writeCollection(docs, col)

        conn.createIndex(col, [('dataset', '+')], unique=False)
        conn.createIndex(col, [('dataset', '+'), ('year', '+')])
