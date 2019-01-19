
from flask import json


def test_info_DBs(client):
    res = client.get('/api/v1/dbs/')
    data = json.loads(res.data)
    assert b'SES' in res.data
    assert 3 == len(data)


def test_info_Signals(client):
    res_1 = client.get('/api/v1/dbs/SES/signals/')
    res_2 = client.get('/api/v1/dbs/SES/signals/?id=165_6hr')
    res_3 = client.get('/api/v1/dbs/SES/signals/?id=165')

    assert b'165_6hr' in res_1.data
    assert b'success' in res_2.data
    assert res_3.status_code == 404


# def test_app1(client):
#     assert client.get('/api/v1/test1/').status_code == 200

# def test_app_get(client):
#     res = client.get('/api/v1/test1/')
#     assert b'get' in res.data


# def test_app_put(client):
#     res = client.put('/api/v1/test1/')
#     assert b'put' in res.data


# def test_app_delete(client):
#     res = client.delete('/api/v1/test1/')
#     assert b'delete' in res.data


# def test_app_another(client):
#     assert client.get('/api/v1/test5/').status_code == 404
