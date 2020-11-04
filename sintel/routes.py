from flask import render_template
from flask_restful import Api
from flasgger import Swagger

import sintel.resources as ctrl
from sintel.swagger import swagger_config, swagger_tpl

API_VERSION = '/api/v1/'


def add_routes(app):

    @app.route('/redoc')
    def redoc():
        return render_template('redoc.html')

    # configure RESTful APIs
    api = Api(app)

    # configure API documentation
    Swagger(app, config=swagger_config, template=swagger_tpl, parse=True)

    # user management
    api.add_resource(ctrl.user.Signup, API_VERSION + 'users/signup/')
    api.add_resource(ctrl.user.Signin, API_VERSION + 'users/signin/')
    api.add_resource(ctrl.user.Signout, API_VERSION + 'users/signout/')
    api.add_resource(ctrl.user.Reset, API_VERSION + 'users/reset/')

    # google login
    api.add_resource(ctrl.google_auth.GoogleAuthentication,
                     API_VERSION + 'auth/google_login/')

    #  user info
    api.add_resource(ctrl.user.User, API_VERSION + 'users/<string:user_id>/')
    api.add_resource(ctrl.user.Users, API_VERSION + 'users/')

    # comment
    api.add_resource(ctrl.comment.Comment, API_VERSION + 'comments/<string:comment_id>/')
    api.add_resource(ctrl.comment.Comments, API_VERSION + 'comments/')

    # datarun
    api.add_resource(ctrl.datarun.Datarun, API_VERSION + 'dataruns/<string:datarun_id>/')
    api.add_resource(ctrl.datarun.Dataruns, API_VERSION + 'dataruns/')

    # dataset
    api.add_resource(ctrl.dataset.Dataset, API_VERSION + 'datasets/<string:dataset_name>/')
    api.add_resource(ctrl.dataset.Datasets, API_VERSION + 'datasets/')

    # event
    api.add_resource(ctrl.event.Event, API_VERSION + 'events/<string:event_id>/')
    api.add_resource(ctrl.event.Events, API_VERSION + 'events/')
    api.add_resource(ctrl.event.EventInteraction, API_VERSION + 'event_interaction/')

    # experiment
    api.add_resource(ctrl.experiment.Experiment, API_VERSION
                     + 'experiments/<string:experiment_id>/')
    api.add_resource(ctrl.experiment.Experiments, API_VERSION
                     + 'experiments/')

    # pipeline
    api.add_resource(ctrl.pipeline.Pipeline, API_VERSION
                     + 'pipelines/<string:pipeline_name>/')
    api.add_resource(ctrl.pipeline.Pipelines, API_VERSION + 'pipelines/')

    # signal
    api.add_resource(ctrl.signal.Signal, API_VERSION + 'signals/<string:signal_name>/')
    api.add_resource(ctrl.signal.Signals, API_VERSION + 'signals/')
    api.add_resource(ctrl.signal.SignalRaw, API_VERSION + 'signalraw/')
    api.add_resource(ctrl.signal.AvailableSignalruns,
                     API_VERSION + 'available_signalruns/')

    # computing resources
    api.add_resource(ctrl.computing.similar_windows.SimilarWindows,
                     API_VERSION + 'computings/similar_windows/')

    # test
    api.add_resource(ctrl.test.Test, API_VERSION + 'test/')
