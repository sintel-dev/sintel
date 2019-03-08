# config file for py.test: test flask application

from mtv.explorer import MTVExplorer
import pytest



# @pytest.fixture
# def app():
#     app = create_flask_app()
#     return app


@pytest.fixture
def app():
    explorer = MTVExplorer()
    app = explorer._init_flask_app('test')
    return app
