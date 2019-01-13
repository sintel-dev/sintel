
def test_app1(client):
    assert client.get('/api/v1/test1/').status_code == 200


def test_app_get(client):
    res = client.get('/api/v1/test1/')
    assert b'get' in res.data


def test_app_put(client):
    res = client.put('/api/v1/test1/')
    assert b'put' in res.data


def test_app_delete(client):
    res = client.delete('/api/v1/test1/')
    assert b'delete' in res.data


def test_app_another(client):
    assert client.get('/api/v1/test5/').status_code == 404
