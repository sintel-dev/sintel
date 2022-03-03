#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""The setup script."""

from setuptools import setup, find_packages

try:
    with open('README.md', encoding='utf-8') as readme_file:
        readme = readme_file.read()
except IOError:
    readme = ''

try:
    with open('HISTORY.md', encoding='utf-8') as history_file:
        history = history_file.read()
except IOError:
    history = ''

install_requires = [
    # Sintel
    'orion-ml==0.2.0',

    # General
    'termcolor==1.1.0',
    'PyYAML==5.1',
    'passlib==1.7.2',
    'tqdm==4.48.0',

    # Auth
    'oauthlib==3.1.0',
    'pyOpenSSL==19.1.0',

    # Math
    'pyts==0.10.0',

    # Flask
    'Flask==1.0.2',
    'Flask-Cors==3.0.7',
    'Flask-RESTful==0.3.7',
    'itsdangerous==2.0.1',
    'MarkupSafe==2.0.1',
    'requests==2.24.0',
    'Werkzeug==0.15.3',
    'gevent>=21.12.0',
    'flasgger==0.9.5',

    # Database
    'pymongo>=3.7.2,<4',
    'mongoengine>=0.20.0,<0.25'
]

tests_require = [
    'pytest>=3.4.2',
    'pytest-cov>=2.6.0',
    'pytest-flask>=0.14.0',
    'pytest-xdist>=1.25.0'
]

development_requires = [
    # general
    'bumpversion>=0.5.3',
    'pip>=9.0.1',
    'watchdog>=0.8.3',
    'jupyter>=1.0.0',

    # style check
    'flake8>=3.5.0',
    'isort>=4.3.4,<5.0.0',

    # fix style issues
    'autoflake>=1.1',
    'autopep8>=1.3.5',

    # distribute on PyPI
    'twine>=1.10.0',
    'wheel>=0.30.0',

    # advanced testing
    'coverage>=4.5.1,<6',
    'tox>=2.9.1,<4',
    'invoke'
]


setup(
    author="MIT Data To AI Lab",
    author_email='dailabmit@gmail.com',
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Natural Language :: English',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7'
    ],
    description=("Sintel (Signal Intelligence): A Machine Learning Framework"
                 "to Extract Insights from Signals"),
    entry_points={
        'console_scripts': [
            'sintel=sintel.cli:main',
        ],
    },
    extras_require={
        'test': tests_require,
        'dev': development_requires + tests_require,
    },
    install_package_data=True,
    install_requires=install_requires,
    license="MIT license",
    long_description=readme + '\n\n' + history,
    long_description_content_type='text/markdown',
    include_package_data=True,
    keywords='sintel',
    name='sintel',
    packages=find_packages(include=['sintel', 'sintel.*']),
    python_requires='>=3.6, <3.8',
    test_suite='tests',
    url='https://github.com/sintel-dev/sintel',
    version='0.1.0.dev0',
    zip_safe=False
)
