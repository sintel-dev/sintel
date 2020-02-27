#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""The setup script."""

from setuptools import setup, find_packages

with open('README.md', encoding='utf-8') as readme_file:
    readme = readme_file.read()

with open('HISTORY.md', encoding='utf-8') as history_file:
    history = history_file.read()

requirements = [
    'Click>=6.0',

    # General
    'termcolor==1.1.0',
    'PyYAML==5.1',
    'passlib==1.7.2',

    # Math
    'numpy>=1.15.4,<1.17',
    'pandas>=0.23.4,<0.25',

    # Flask
    'Flask==1.0.2',
    'Flask-Cors==3.0.7',
    'Flask-RESTful==0.3.7',
    'Werkzeug==0.15.3',
    'gevent==1.2.2',

    # Database
    'mongoengine>=0.16.3,<0.17',
    'pymongo>=3.7.2,<4'
]

setup_requirements = [
    'pytest-runner>=2.11.1',
]

test_requirements = [
    'coverage>=4.5.1',
    'pytest>=4.0.2',
    'tox>=2.9.1',

    # ------------- Flask --------------- #
    'pytest-flask>=0.14.0',
    'pytest-xdist>=1.25.0',
]

development_requirements = [
    # general
    'bumpversion>=0.5.3',
    'pip>=9.0.1',
    'watchdog>=0.8.3',

    # docs
    'm2r>=0.2.0',
    'Sphinx>=1.7.1',
    'sphinx_rtd_theme>=0.2.4',

    # style check
    'flake8>=3.5.0',
    'isort>=4.3.4',

    # fix style issues
    'autoflake>=1.1',
    'autopep8>=1.3.5',

    # distribute on PyPI
    'twine>=1.10.0',
    'wheel>=0.30.0',
    'jupyter>=1.0.0'
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
        'Programming Language :: Python :: 3.6'
    ],
    description="MTV is a visual analytics system built for satellite data analysis.",
    entry_points={
        'console_scripts': [
            'mtv=mtv.cli:main',
        ],
    },
    extras_require={
        'test': test_requirements,
        'dev': development_requirements + test_requirements,
    },
    install_package_data=True,
    install_requires=requirements,
    license="MIT license",
    long_description=readme + '\n\n' + history,
    long_description_content_type='text/markdown',
    include_package_data=True,
    keywords='mtv',
    name='mtv',
    packages=find_packages(include=['mtv', 'mtv.*']),
    python_requires='>=3.6',
    setup_requires=setup_requirements,
    test_suite='tests',
    tests_require=test_requirements,
    url='https://github.com/HDI-Project/MTV',
    version='0.1.0-dev',
    zip_safe=False,
)
