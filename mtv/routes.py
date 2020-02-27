import string
from flask import render_template
from flask_restful import Api

import mtv.resources as ctrl

current_api_version = '/api/v1/'


def add_routes(app):

    # add index.html
    @app.route('/')
    @app.route('/index')
    def index():
        return render_template('index.html')

    # configure RESTful APIs
    api = Api(app)

    # user management
    # api.add_resource(ctrl.user.Users, current_api_version + 'users/')
    # api.add_resource(ctrl.user.Users, current_api_version + 'users/me/')
    # api.add_resource(ctrl.user.Users, current_api_version + 'users/accounts/')
    # api.add_resource(ctrl.user.Users, current_api_version + 'users/password/')
    # api.add_resource(ctrl.user.Users, current_api_version + 'users/picture/')
    api.add_resource(ctrl.user.Signup, current_api_version + 'auth/signup/')
    api.add_resource(ctrl.user.Signin, current_api_version + 'auth/signin/')
    api.add_resource(ctrl.user.Signout, current_api_version + 'auth/signout/')

    # data
    api.add_resource(ctrl.data.Data, current_api_version + current_api_version + 'data/')

    # comment
    api.add_resource(ctrl.comment.Comment, current_api_version + 'comments/<string:comment_id>/')
    api.add_resource(ctrl.comment.Comments, current_api_version + 'comments/')

    # datarun
    api.add_resource(ctrl.datarun.Datarun, current_api_version + 'dataruns/<string:datarun_id>/')
    api.add_resource(ctrl.datarun.Dataruns, current_api_version + 'dataruns/')

    # dataset
    api.add_resource(ctrl.dataset.Dataset, current_api_version + 'datasets/<string:dataset_name>/')
    api.add_resource(ctrl.dataset.Datasets, current_api_version + 'datasets/')

    # event
    api.add_resource(ctrl.event.Event, current_api_version + 'events/<string:event_id>/')
    api.add_resource(ctrl.event.Events, current_api_version + 'events/')

    # experiment
    api.add_resource(ctrl.experiment.Experiment, current_api_version +
                     'experiments/<string:experiment_id>/')
    api.add_resource(ctrl.experiment.Experiments, current_api_version + 'experiments/')

    # pipeline
    api.add_resource(ctrl.pipeline.Pipeline, current_api_version +
                     'pipelines/<string:pipeline_name>/')
    api.add_resource(ctrl.pipeline.Pipelines, current_api_version + 'pipelines/')

    # signal
    api.add_resource(ctrl.signal.Signal, current_api_version + 'signals/<string:signal_name>/')
    api.add_resource(ctrl.signal.Signals, current_api_version + 'signals/')

    # test
    api.add_resource(ctrl.test.Test, current_api_version + 'test/')
