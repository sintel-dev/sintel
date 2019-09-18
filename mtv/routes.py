from flask import render_template
from flask_restful import Api

import mtv.resources as ctrl


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)

    api.add_resource(ctrl.data.Data, '/api/v1/data/')

    api.add_resource(ctrl.dataset.Dataset, '/api/v1/datasets/<string:dataset>/')
    api.add_resource(ctrl.dataset.Datasets, '/api/v1/datasets/')

    # comment
    api.add_resource(ctrl.comment.Comment, '/api/v1/comments/<string:comment_id>/')
    api.add_resource(ctrl.comment.Comments, '/api/v1/comments/')

    # datarrun
    api.add_resource(ctrl.datarun.Datarun, '/api/v1/dataruns/<string:datarun_id>/')
    api.add_resource(ctrl.datarun.Dataruns, '/api/v1/dataruns/')

    # event
    api.add_resource(ctrl.event.Event, '/api/v1/events/<string:event_id>/')
    api.add_resource(ctrl.event.Events, '/api/v1/events/')

    # experiment
    api.add_resource(ctrl.experiment.Experiment, '/api/v1/experiments/<string:experiment_id>/')
    api.add_resource(ctrl.experiment.Experiments, '/api/v1/experiments/')

    # pipeline
    api.add_resource(ctrl.pipeline.Pipeline, '/api/v1/pipelines/<string:pipeline_id>/')
    api.add_resource(ctrl.pipeline.Pipelines, '/api/v1/pipelines/')

    # test
    api.add_resource(ctrl.test.Test, '/api/v1/test/')
