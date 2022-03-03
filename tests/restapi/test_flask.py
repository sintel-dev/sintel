"""Test Flasks."""


def test_app_get(client):
    res = client.get('/api/v1/test/')
    assert res.status_code == 200
    # assert b'get' in res.data


def test_app_post(client):
    res = client.post('/api/v1/test/')
    assert res.status_code == 200
    # assert b'put' in res.data
