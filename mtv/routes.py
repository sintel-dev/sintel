from flask import render_template
from flask_restful import Api

from mtv.controllers import comment, data, datarun, dataset, event, pipeline


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)

    api.add_resource(dataset.Dataset, '/api/v1/datasets/<string:dataset>/')
    api.add_resource(dataset.Datasets, '/api/v1/datasets/')

    api.add_resource(datarun.Datarun, '/api/v1/dataruns/<string:datarun>/')
    api.add_resource(datarun.Dataruns, '/api/v1/dataruns/')

    api.add_resource(pipeline.Pipeline, '/api/v1/pipelines/<string:pipeline>/')
    api.add_resource(pipeline.Pipelines, '/api/v1/pipelines/')

    api.add_resource(event.Event, '/api/v1/events/<string:event>/')
    api.add_resource(event.Events, '/api/v1/events/')

    api.add_resource(comment.Comment, '/api/v1/comments/<string:comment>/')
    api.add_resource(comment.Comments, '/api/v1/comments/')

    api.add_resource(data.Data, '/api/v1/data/')
