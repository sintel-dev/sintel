from flask import render_template
from flask_restful import Api

from mtv.controllers import info


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)
    api.add_resource(info.DBs, '/api/v1/dbs/')
    api.add_resource(info.Signals, '/api/v1/dbs/<string:db_name>/signals/')
