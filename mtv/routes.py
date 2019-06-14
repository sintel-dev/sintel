from flask import render_template
from flask_restful import Api
import mtv.controllers as ctrl


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')
    
    # configure RESTful APIs
    api = Api(app)

    api.add_resource(ctrl.dataset.Dataset, '/api/v1/datasets/<string:dataset>/')
    api.add_resource(ctrl.dataset.Datasets, '/api/v1/datasets/')

    api.add_resource(ctrl.datarun.Datarun, '/api/v1/dataruns/<string:datarun>/')
    api.add_resource(ctrl.datarun.Dataruns, '/api/v1/dataruns/')

    api.add_resource(ctrl.pipeline.Pipeline, '/api/v1/pipelines/<string:pipeline>/')
    api.add_resource(ctrl.pipeline.Pipelines, '/api/v1/pipelines/')

    api.add_resource(ctrl.event.Event, '/api/v1/events/<string:event>/')
    api.add_resource(ctrl.event.Events, '/api/v1/events/')

    api.add_resource(ctrl.comment.Comment, '/api/v1/comments/<string:comment>/')
    api.add_resource(ctrl.comment.Comments, '/api/v1/comments/')

    api.add_resource(ctrl.data.Data, '/api/v1/data/')

    # experiment
    api.add_resource(ctrl.experiment.Experiment, '/api/v1/experiments/<string:experiment>/')
    api.add_resource(ctrl.experiment.Experiments, '/api/v1/experiments/')


