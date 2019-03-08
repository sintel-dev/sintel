class Base(object):
    DEBUG = None
    TESTING = None
    DATABASE = {
        'host': 'localhost',
        'port': 27017,
        'name': 'mtv'
    }


class Development(Base):
    DEBUG = True
    TESTING = True


class Production(Base):
    DEBUG = False
    TESTING = False


class Test(Base):
    DEBUG = False
    TESTING = True

