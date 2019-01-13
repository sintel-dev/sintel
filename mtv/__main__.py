"""Read the latest MTV tutorials
Usage:
------
    $ mtv [options]
List the latest tutorials:

Version:
--------
- mtv v0.0.1
"""
import os
import sys

from flask import Flask
from flask_cors import CORS
from gevent.wsgi import WSGIServer
from termcolor import colored

from mtv._globals import setup_global
from mtv.routes import add_routes


def create_flask_app(env='dev'):
    app = Flask(
        __name__,
        static_url_path='',
        static_folder='../client',
        template_folder='../client'
    )

    if (env == 'prod'):
        app.config.from_object('mtv._config.ProductionConfig')
    elif (env == 'dev'):
        app.config.from_object('mtv._config.DevelopmentConfig')
    elif (env == 'test'):
        app.config.from_object('mtv._config.TestingConfig')

    CORS(app)

    add_routes(app)

    return app


def run():
    # just in case running app with the absolute path
    sys.path.append(os.path.dirname(__file__))

    # set up flask app
    env = 'dev' if len(sys.argv) <= 1 else sys.argv[1]
    app = create_flask_app(env)

    # set up global env
    setup_global(app)

    # run flask server
    if (env == 'dev'):
        # debug mode with reload
        from werkzeug.serving import run_with_reloader
        from werkzeug.debug import DebuggedApplication

        def http_server():
            print(colored(
                'Starting up FLASK APP in development mode',
                'yellow'))
            print(colored('Available on:', 'yellow'))
            print('  http://127.0.0.1:' + colored('3001', 'green'))
            sys.stdout.flush()
            server = WSGIServer(('127.0.0.1', 3001), DebuggedApplication(app))
            server.serve_forever()
        run_with_reloader(http_server)
    elif (env == 'prod'):
        # production mode
        print(colored('Starting up FLASK APP in production mode', 'yellow'))
        print(colored('Available on:', 'yellow'))
        print('  http://127.0.0.1:' + colored('3001', 'green'))
        http_server = WSGIServer(('127.0.0.1', 3001), app)
        sys.stdout.flush()
        http_server.serve_forever()


if __name__ == "__main__":
    run()
