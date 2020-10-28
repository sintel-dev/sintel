schemas = {
    'Species': {
        'type': 'object',
        'properties': {
            'id': {
                'type': 'integer',
                'format': 'int64'
            },
            'name': {
                'type': 'string'
            }
        }
    },
    'Animals': {
        'type': 'object',
        'properties': {
            'species': {
                '$ref': '#/components/schemas/Species'
            },
            'name': {
                'type': 'string'
            }
        }
    },
    'Signal': {
        'type': 'object',
        'properties': {
            'id': {
                'type': 'string',
            },
            'insert_time': {
                'type': 'string',
            },
            'name': {
                'type': 'string',
            },
            'dataset': {
                'type': 'string',
            },
            'start_time': {
                'type': 'integer',
            },
            'stop_time': {
                'type': 'integer',
            },
            'created_by': {
                'type': 'string',
            }
        }
    }
}

tags = [
    {
        'name': 'default',
        'description': 'Uncategorized APIs'
    },
    {
        'name': 'signal',
        'description': 'Everything bout signal interactions'
    }, {
        'name': 'signalrun',
        'description': 'Everything bout signalrun interactions'
    },
    {
        'name': 'test',
        'description': 'Using these APIs to do the basic test'
    },
]


swagger_config = {
    'title': 'MTV RestAPI Documentation',
    'uiversion': 3,
    'openapi': '3.0.2',
    'version': '1.0.0',
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

swagger_tpl = {
    'tags': tags,
    'components': {
        'schemas': schemas
    }
}
