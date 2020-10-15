def test_swag(specs_data):
    """
    This test is runs automatically in Travis CI

    :param app: Flask app
    :param client: Flask app test client
    """

    for url, spec in specs_data.items():
        assert 'Palette' in spec['definitions']
        assert 'Color' in spec['definitions']
