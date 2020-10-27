schemas = {
    'Species': {
        {
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
    }
}

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
    "components": {
        'schemas': schemas
    },
    "specs_route": "/apidocs/"
}
