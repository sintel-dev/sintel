import logging
import os
import sys
from flask import Flask
from flask_cors import CORS
from gevent.wsgi import WSGIServer
from termcolor import colored
from mongoengine import connect
from mtv.db import db
from mtv.routes import add_routes
from mtv.utils import import_object

LOGGER = logging.getLogger(__name__)


class MTVExplorer:

    def __init__(self, database, **kwargs):
        # self._db = db.connect(database=database)
        self._db = connect(database, **kwargs)

    def _init_flask_app(self, env):
        app = Flask(
            __name__,
            static_url_path='',
            static_folder='../client',
            template_folder='../client'
        )

        if env == 'production':
            app.config.from_object('mtv.config.Production')
    
        elif env == 'development':
            app.config.from_object('mtv.config.Development')
        
        elif env == 'test':
            app.config.from_object('mtv.config.Test')

        CORS(app)

        add_routes(app)

        return app

    def _http_server(self):
        LOGGER.info(colored('Starting up FLASK APP in {} mode'.format(self.env),
                    'yellow'))

        LOGGER.info(colored('Available on:', 'yellow') +
                    '  http://127.0.0.1:' + colored(self.port, 'green'))

        if self.env == 'development':
            debug = import_object('werkzeug.debug.DebuggedApplication')
            server = WSGIServer(('127.0.0.1', self.port), debug(self.app))
        
        elif self.env == 'production':
            server = WSGIServer(('127.0.0.1', self.port), self.app, log=None)

        server.serve_forever()

    def run_server(self, env, port):
        # validation
        if env not in ['development', 'production', 'test']:
            LOGGER.exception("env '%s' is not in "
                            "['development', 'production', 'test']", env)
            raise ValueError                        

        # just in case running app with the absolute path
        sys.path.append(os.path.dirname(__file__))

        self.port = port
        self.env = env
        self.app = self._init_flask_app(env)


        if env == 'development':
            reloader = import_object('werkzeug.serving.run_with_reloader')
            reloader(self._http_server)

        elif env == 'production':
            self._http_server()
