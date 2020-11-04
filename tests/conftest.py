import pytest
import json
import random
from flasgger import Swagger
from sintel.core import MTV
from sintel.utils import read_config


TEST_DB = 'mtv-test'
TEST_HOST = "localhost"
TEST_PORT = 27017


@pytest.fixture(scope='session')
def app():
    """
    Set up Flask App in testing environment
    """

    config = read_config('./mtv/config.yml')
    config['db'] = TEST_DB
    config['host'] = TEST_HOST
    config['port'] = TEST_PORT
    explorer = MTV(config)

    app = explorer._init_flask_app('test')

    return app


@pytest.fixture(scope='function')
def specs_data(app, client):
    """
    return all specs dictionary for the Flask App
    """
    specs_route = None
    specs_data = dict()
    swag = getattr(app, 'swag', None)

    # init swag if not yet inititalized (no-routes example)
    if swag is None:
        _swag = Swagger()
        _swag.config['endpoint'] = str(random.randint(1, 5000))
        _swag.init_app(app)
    # get all the specs defined for the example app
    else:
        try:
            flasgger_config = swag.config

            if flasgger_config.get('swagger_ui') is False:
                return specs_data

            specs_route = flasgger_config.get('specs_route', '/apidocs/')
        except AttributeError:
            pass

    if specs_route is None:
        specs_route = '/apidocs/'

    apidocs = client.get('?'.join((specs_route, 'json=true')))
    specs = json.loads(apidocs.data.decode("utf-8")).get('specs')

    for spec in specs:
        # for each spec get the spec url
        url = spec['url']
        response = client.get(url)
        decoded = response.data.decode("utf-8")
        specs_data[url] = json.loads(decoded)

    return specs_data
