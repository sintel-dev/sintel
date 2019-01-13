from flask_restful import Resource


class Test1(Resource):
    def get(self):
        print('test get')
        return 'get'

    def post(self):
        print('test post')
        return 'post'

    def delete(self):
        print('test delete')
        return 'delete'

    def put(self):
        print('test put')
        return 'put'


class Test2(Resource):
    def get(self):
        print('test get')
        return 'get'

    def post(self):
        print('test post')
        return 'post'

    def delete(self):
        print('test delete')
        return 'delete'

    def put(self):
        print('test put')
        return 'put'
