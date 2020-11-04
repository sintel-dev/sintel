schemas = {
    'Annotation': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'event': {'type': 'string', 'description': 'event ID'},
            'text': {'type': 'string'},
            'created_by': {'type': 'string'}
        }
    },
    'EventInteraction': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'event': {'type': 'string', 'description': 'event ID'},
            'action': {'type': 'string'},
            'tag': {'type': 'string'},
            'annotation': {'type': 'string', 'description': 'annt ID'},
            'start_time': {'type': 'integer'},
            'stop_time': {'type': 'integer'},
            'insert_time': {'type': 'string', 'description': 'ISO format'},
            'created_by': {'type': 'string'}
        }
    },
    'Event': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'insert_time': {'type': 'string'},
            'start_time': {'type': 'integer'},
            'stop_time': {'type': 'integer'},
            'score': {'type': 'integer'},
            'tag': {'type': 'string'},  # todo: use enum
            'datarun': {'type': 'string', 'description': 'datarun ID'},
            'source': {'type': 'string'},  # todo: use enum
            'comments': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'additionalProperties': {}
                }
            }
        }
    },
    'Dataset': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'insert_time': {'type': 'string'},
            'name': {'type': 'string'},
            'entity': {'type': 'string'},
            'created_by': {'type': 'string'}
        }
    },
    'Signalrun': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'signalrun_id': {'type': 'string'},
            'experiment': {'type': 'string', 'description': 'exp ID'},
            'signal': {'type': 'string', 'description': 'signal name'},
            'signal_id': {'type': 'string', 'description': 'signal ID'},
            'start_time': {'type': 'string', 'description': 'ISO format'},
            'end_time': {'type': 'string', 'description': 'ISO format'},
            'status': {'type': 'string'},
            'events': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'additionalProperties': {}
                }
            },
            'raw': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'additionalProperties': {}
                }
            },
            'prediction': {
                'type': 'object',
                'properties': {
                    'name': {
                        'type': 'array',
                        'items': {'type': 'string'},
                        'maxItems': 7
                    },
                    'data': {
                        'type': 'array',
                        'items': {
                            'type': 'array',
                            'items': {'type': 'number'},
                            'maxItems': 7
                        }
                    }
                }
            }
        }
    },
    'Experiment': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'name': {'type': 'string'},
            'created_by': {'type': 'string'},
            'date_creation': {'type': 'string'},
            'project': {'type': 'string'},
            'dataset': {'type': 'string'},
            'pipeline': {'type': 'string'},
            'dataruns': {
                'type': 'array',
                'items': {
                    '$ref': '#/components/schemas/Signalrun'
                }
            },
        }
    },
    'Pipeline': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'insert_time': {'type': 'string'},
            'name': {'type': 'string'},
            'created_by': {'type': 'string'},
            'json': {
                'type': 'object',
                'additionalProperties': {}
            },
        }
    },
    'User': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'name': {'type': 'string'},
            'email': {'type': 'string'},
            'picture': {
                'type': 'string',
                'description': 'base64 string'
            },
        }
    },
    'Signal': {
        'type': 'object',
        'properties': {
            'id': {'type': 'string'},
            'insert_time': {'type': 'string'},
            'name': {'type': 'string'},
            'dataset': {'type': 'string'},
            'start_time': {'type': 'integer'},
            'stop_time': {'type': 'integer'},
            'created_by': {'type': 'string'}
        },
        'required': ['id', 'insert_time', 'name', 'dataset',
                     'start_time', 'stop_time', 'created_by']
    },
    'Message': {
        'type': 'object',
        'properties': {
            'code': {'type': 'string', 'minimum': 100, 'maximum': 600},
            'message': {'type': 'string'}
        },
        'required': ['code', 'message']
    },
    'TestMessage': {
        'allOf': [
            {'$ref': '#/components/schemas/Message'},
            {
                'type': 'object',
                'properties': {
                    'data': {}
                }
            }
        ]
    }
}

tags = [
    {
        'name': 'annotation',
        'description': 'Everything about annotation interactions'
    },
    {
        'name': 'event',
        'description': 'Everything about event interactions'
    },
    {
        'name': 'dataset',
        'description': 'Everything about dataset interactions'
    },
    {
        'name': 'experiment',
        'description': 'Everything about experiment interactions'
    },
    {
        'name': 'pipeline',
        'description': 'Everything about pipeline interactions'
    },
    {
        'name': 'signal',
        'description': 'Everything about signal interactions'
    }, {
        'name': 'signalrun',
        'description': 'Everything about signalrun interactions'
    }, {
        'name': 'user',
        'description': 'User login/logout/register etc.'
    },
    {
        'name': 'test',
        'description': 'Using these APIs to do the basic test'
    },
]


swagger_config = {
    'title': 'Sintel RestAPI Documentation',
    'uiversion': 3,
    'openapi': '3.0.2',
    'doc_dir': './apidocs/resources/',
    "headers": [
    ],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,  # all in
            "model_filter": lambda tag: True,  # all in
        }
    ],
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

markdown_text = """
<p align="left">
<img width=10% src="https://dai.lids.mit.edu/wp-content/uploads/2018/06/\
Logo_DAI_highres.png" alt=“DAI-Lab” />
<i>An open source project from Data to AI Lab at MIT.</i>
</p>

# What is Sintel?
**Sintel** (Signal Intelligence) provides Restful APIs to process massive
signal data for anomaly analysis in an efficient and user-friendly way.
To showcase the use of this library, we have built an example visual analytics
system, MTV (multivariate time series visualization) -- which is built upon
Sintel, to support users investigating and annotating time series anomalies
in an very efficient and organized way.

# License

[The MIT License](https://github.com/HDI-Project/MTV/blob/master/LICENSE)
"""
# markdown_text = """
# <p align="left">
# <img width=10% src="https://dai.lids.mit.edu/wp-content/uploads/2018/06/\
# Logo_DAI_highres.png" alt=“DAI-Lab” />
# <i>An open source project from Data to AI Lab at MIT.</i>
# </p>

# [![Build Status](https://travis-ci.com/dyuliu/mtv.svg?branch=master)]\
# (https://travis-ci.com/dyuliu/mtv)
# [![Coverage Status](https://coveralls.io/repos/github/dyuliu/MTV/badge.svg)]\
# (https://coveralls.io/github/dyuliu/MTV)
# [![Github All Releases](https://img.shields.io/github/downloads/dyuliu/MTV/\
# total)](https://github.com/dyuliu/MTV/releases)
# [![Docker Pulls](https://img.shields.io/docker/pulls/dyuliu/mtv)]\
# (https://hub.docker.com/r/dyuliu/mtv)

# # What is MTV?
# **MTV** (multivariate time series data visuaization) is a visual analytics \
# system built for anomaly analysis of multiple time-series data.

# # License

# [The MIT License](https://github.com/HDI-Project/MTV/blob/master/LICENSE)
# """


swagger_tpl = {
    'info': {
        'description': markdown_text,
        'title': 'Sintel RestAPI Documentation',
        'version': '1.0.0'
    },
    'tags': tags,
    'components': {
        'schemas': schemas,
        'securitySchemes': {
            'tokenAuth': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'Authorization',
                'description': 'Use `pineapple` as the value to test the auth.'
            },
            'uidAuth': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'uid',
                'description': 'Use `pineapple` as the value to test the auth.'
            }
        },
        'responses': {
            'ErrorMessage': {
                'description': 'Error message',
                'content': {
                    'application/json': {
                        'schema': {'$ref': '#/components/schemas/Message'}
                    }
                }
            },
            'UnauthorizedError': {
                'description': ('Authentication information is missing '
                                'or invalid'),
                'content': {
                    'application/json': {
                        'schema': {'$ref': '#/components/schemas/Message'}
                    }
                }
            }
        }
    },
    'servers': [
        {
            'url': 'http://localhost:3000/',
            'description': 'Internal staging server for testing'
        },
        {
            'url': 'http://mtv.lids.mit.edu:3000/',
            'description': 'Main production server'
        }
    ]
}
