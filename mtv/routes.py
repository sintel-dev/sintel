from flask import render_template
from flask_restful import Api

from mtv.controllers import info, ses


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)
    api.add_resource(info.DBList, '/api/v1/dbs/')
    api.add_resource(info.SignalList, '/api/v1/dbs/<string:db_name>/signals/')
    api.add_resource(ses.Signals,
                     '/api/v1/dbs/<string:db_name>/signals/<string:sig_name>/')
