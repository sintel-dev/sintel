import pytest
from mtv.core import MTV
from mtv.utils import read_config


TEST_DB = 'mtv-test'
TEST_HOST = "localhost"
TEST_PORT = 27017


@pytest.fixture(scope='session')
def app():
    config = read_config('./mtv/config.yml')
    config['db'] = TEST_DB
    config['host'] = TEST_HOST
    config['port'] = TEST_PORT
    explorer = MTV(config)

    app = explorer._init_flask_app('test')

    return app
