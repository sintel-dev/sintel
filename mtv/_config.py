class BaseConfig(object):
    DEBUG = None
    TESTING = None
    MONGODB = {
        'host': 'localhost',
        'port': 27017,
        'db': 'mtv'
    }


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = True


class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False


class TestingConfig(BaseConfig):
    DEBUG = False
    TESTING = True
