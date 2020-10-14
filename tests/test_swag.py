import json
import random
from flasgger import Swagger


def test_swag(app, client):
    """
    This test is runs automatically in Travis CI

    :param app: Flask app
    :param client: Flask app test client
    """
    # init swag if not yet inititalized (no-routes example)
    specs_route = None
    specs_data = {}
    swag = getattr(app, 'swag', None)
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

    for url, spec in specs_data.items():
        assert 'Palette' in spec['definitions']
        assert 'Color' in spec['definitions']
        assert 'colors' in spec['paths']['/colors/{palette}/']['get']['tags']
