from mtv.core import MTV
from mtv.utils import read_config
import pytest


@pytest.fixture
def app():
    config = read_config('./mtv/config.yaml')
    explorer = MTV(config)
    app = explorer._init_flask_app('test')
    return app
