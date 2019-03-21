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

    api.add_resource(info.Datasets, '/api/v1/datasets/')

    api.add_resource(info.Dataruns,
                     '/api/v1/datasets/<string:dataset>/dataruns/')

    api.add_resource(info.Pipeline,
                     '/api/v1/pipelines/<string:pipeline>/')

    api.add_resource(info.Data,
                     '/api/v1/datasets/<string:dataset>/'
                     'dataruns/<string:datarun>/')
