import logging
import os
import sys

from flask import Flask
from flask_cors import CORS
from gevent.wsgi import WSGIServer
from mongoengine import connect
from termcolor import colored

from mtv.data.processor import add_raw
from mtv.routes import add_routes
from mtv.utils import import_object

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

            LOGGER.info(colored('Available on:', 'yellow')
                        + '  http://0.0.0.0:' + colored(port, 'green'))

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

    def add_rawdata(self, col, data_folder_path):
        add_raw({
            'address': self._cf['host'],
            'port': self._cf['port'],
            'db': self._cf['db']
        }, col, data_folder_path)
