.DEFAULT_GOAL := help

define BROWSER_PYSCRIPT
import os, webbrowser, sys

try:
	from urllib import pathname2url
except:
	from urllib.request import pathname2url

webbrowser.open("file://" + pathname2url(os.path.abspath(sys.argv[1])))
endef
export BROWSER_PYSCRIPT

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("%-20s %s" % (target, help))
endef
export PRINT_HELP_PYSCRIPT

BROWSER := python -c "$$BROWSER_PYSCRIPT"

.PHONY: help
help:
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)



# ----------------------- session: install ----------------------- #

.PHONY: install
install: clean-build clean-pyc clean-client ## install the packages for running mtv
	pip install -e .
	cd client && npm install --production

.PHONY: install-develop
install-develop: clean-build clean-pyc clean-client ## install the package in editable mode and dependencies for development
	pip install -e .[dev]
	cd client && npm install

.PHONY: init-db
init-db: clean-db
	mkdir -p db-instance
	mkdir -p db-instance/data
	mkdir -p db-instance/log
	mkdir -p db-instance/dump

.PHONY: load-db-mtv
load-db-mtv: init-db
	rm -f -r db-instance/data/mtv/
	curl -o mtv.tar.bz2 "https://d3-ai-mtv.s3.us-east-2.amazonaws.com/mtv.tar.bz2"
	tar -xf mtv.tar.bz2 -C ./db-instance/data/ && rm mtv.tar.bz2
	mongorestore --db mtv ./db-instance/data/mtv/

# ------------------ session: docker installation ------------------- #
.PHONY: docker-db-up
docker-db-up: init-db	## download and
	curl -o mtv.tar.bz2 "https://d3-ai-mtv.s3.us-east-2.amazonaws.com/mtv.tar.bz2"
	tar -xf mtv.tar.bz2 -C ./db-instance/data/ && rm mtv.tar.bz2
	docker-compose -f docker-compose-db.yml up

.PHONY: docker-up
docker-up: 				## set up
	docker-compose up -d

.PHONY: docker-start
docker-start:
	docker-compose start

.PHONY: docker-stop
docker-stop:
	docker-compose stop

.PHONY: docker-down
docker-down: 			## remove containers, volumes, and networks
	docker-compose down -v

.PHONY: docker-clean
docker-clean: 			## remove containers, volumes, networks, and images
	docker-compose down -v --rmi all

# ----------------------- session: test ----------------------- #

.PHONY: test
test: test-server test-client ## run tests on both server and client

.PHONY: test-server
test-server: ## run tests on server
	py.test -n 2 ./tests

.PHONY: test-server-flask
test-server-flask: ## run tests on server
	py.test ./tests/test_flask.py

.PHONY: test-client
test-client: ## run tests on client
	npm -C client run test:karma

.PHONY: test-coverage
test-coverage: ## check code coverage quickly with the default Python
	coverage run --source mtv -m pytest
	coverage report -m
	coverage html
	$(BROWSER) htmlcov/index.html

.PHONY: test-pyversion
test-pyversion: ## run tests on every Python version with tox
	tox

# -------------- session: coding style check ---------------- #

.PHONY: lint
lint: ## check style with flake8 and isort
	flake8 mtv tests --ignore W503
	isort -c --recursive mtv tests

.PHONY: fix-lint
fix-lint: ## fix lint issues using autoflake, autopep8, and isort
	find mtv -name '*.py' | xargs autoflake --in-place --remove-all-unused-imports --remove-unused-variables
	autopep8 --in-place --recursive --aggressive mtv
	isort --apply --atomic --recursive mtv

	find tests -name '*.py' | xargs autoflake --in-place --remove-all-unused-imports --remove-unused-variables
	autopep8 --in-place --recursive --aggressive tests
	isort --apply --atomic --recursive tests


# ---------------------- session: docs ----------------------- #

.PHONY: docs
docs: clean-docs ## generate Sphinx HTML documentation, including API docs
	sphinx-apidoc --module-first --separate -o docs/api/ mtv
	$(MAKE) -C docs html

.PHONY: view-docs
view-docs: docs ## view docs in browser
	$(BROWSER) docs/_build/html/index.html

.PHONY: serve-docs
serve-docs: view-docs ## compile the docs watching for changes
	watchmedo shell-command -W -R -D -p '*.rst;*.md' -c '$(MAKE) -C docs html' .

.PHONY: api-docs
api-docs:	## generate server API docs
	apidoc -i mtv\\resources\\ -o apidoc\\

# -------------------- session: release ---------------------- #

.PHONY: dist
dist: clean ## builds source and wheel package
	python setup.py sdist
	python setup.py bdist_wheel
	ls -l dist

.PHONY: test-publish
test-publish: dist ## package and upload a release on TestPyPI
	twine upload --repository-url https://test.pypi.org/legacy/ dist/*

.PHONY: publish
publish: dist ## package and upload a release
	twine upload dist/*


# ---------------------- session: clean ----------------------- #

.PHONY: clean
clean: clean-build clean-pyc clean-test clean-coverage \
	   clean-logs clean-docs clean-client

.PHONY: clean-build
clean-build: ## remove build artifacts
	rm -fr build/
	rm -fr dist/
	rm -fr .eggs/
	find . -name '*.egg-info' -exec rm -fr {} +
	find . -name '*.egg' -exec rm -f {} +

.PHONY: clean-pyc
clean-pyc: ## remove Python file artifacts
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

.PHONY: clean-test
clean-test: ## remove test artifacts
	rm -fr .tox/
	rm -fr .pytest_cache

.PHONY: clean-coverage
clean-coverage: ## remove coverage artifacts
	rm -f .coverage
	rm -f .coverage.*
	rm -fr htmlcov/

.PHONY: clean-logs
clean-logs: ## remove logs
	rm -fr logs/

.PHONY: clean-docs
clean-docs: ## remove previously built docs
	rm -f docs/api/*.rst
	-$(MAKE) -C docs clean 2>/dev/null  # this fails if sphinx is not yet installed

.PHONY: clean-client
clean-client: ## remove build artifacts under ./client
	npm -C client run clean

.PHONY: clean-db
clean-db:
	rm -f -r ./db-instance/data/*
	rm -f -r ./db-instance/log/*


