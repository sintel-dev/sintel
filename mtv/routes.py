from flask import render_template
from flask_restful import Api

from mtv.controllers import test


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)
    api.add_resource(test.Test1, '/api/v1/test1/')
    api.add_resource(test.Test2, '/api/v1/test2/')
