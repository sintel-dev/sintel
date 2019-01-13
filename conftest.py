# config file for py.test: test flask application

from mtv.__main__ import create_flask_app
import pytest



@pytest.fixture
def app():
    app = create_flask_app()
    return app
