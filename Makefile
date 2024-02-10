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
install: clean-build clean-pyc  ## install the packages for running sintel
	pip install .

.PHONY: install-test
install-test: clean-build clean-pyc ## install the package and test dependencies
	pip install .[test]

.PHONY: install-develop
install-develop: clean-build clean-pyc  ## install the package in editable mode and dependencies for development
	pip install -e .[dev]

# ----------------------- session: mongodb ----------------------- #

.PHONY: init-db
init-db: clean-db
	mkdir -p db-instance
	# this folder is for saving the downloaded demo mongodb data
	mkdir -p db-instance/data
	# this folder is for saving the log files
	mkdir -p db-instance/log
	# this folder is for saving the newly dumped mongodb data
	mkdir -p db-instance/dump

.PHONY: load-db
load-db: init-db  ## load the demo dataset (NASA)
	curl -o sintel.tar.bz2 "https://sintel-db.s3.us-east-2.amazonaws.com/sintel.tar.bz2"
	tar -xf sintel.tar.bz2 -C ./db-instance/data/ && rm sintel.tar.bz2
	mongosh sintel --eval "db.dropDatabase()"
	mongorestore --db sintel ./db-instance/data/sintel/

.PHONY: load-db-test
load-db-test: init-db  ## load the demo testing dataset for pytest
	curl -o sintel_test.tar.bz2 "https://d3-ai-sintel.s3.us-east-2.amazonaws.com/sintel_test.tar.bz2"
	tar -xf sintel_test.tar.bz2 -C ./db-instance/data/ && rm sintel_test.tar.bz2
	mongosh sintel_test --eval "db.dropDatabase()"
	mongorestore --db sintel_test ./db-instance/data/sintel_test/

# ------------------ session: docker ------------------- #
.PHONY: docker-db-up
docker-db-up: init-db	## download data and load them into mongodb
	curl -o sintel.tar.bz2 "https://sintel-db.s3.us-east-2.amazonaws.com/sintel.tar.bz2"
	tar -xf sintel.tar.bz2 -C ./db-instance/data/ && rm sintel.tar.bz2
	docker-compose -f docker-compose-db.yml up

.PHONY: docker-up
docker-up: 				## set up all the application containers
	docker-compose up -d

.PHONY: docker-stop
docker-stop:			## stops running containers without removing them.
	docker-compose stop

.PHONY: docker-start
docker-start:			## starts the stopped containers again
	docker-compose start

.PHONY: docker-down
docker-down: 			## remove containers, volumes, and networks
	docker-compose down -v

.PHONY: docker-clean
docker-clean: 			## remove containers, volumes, networks, and images
	docker-compose down -v --rmi all

# ----------------------- session: test ----------------------- #

.PHONY: test-unit
test-unit: ## run tests quickly with the default Python
	invoke unit

.PHONY: test-restapi
test-restapi: ## run tests quickly with the default Python
	invoke restapi

.PHONY: test
test: test-unit test-restapi ## test everything that needs test dependencies

.PHONY: test-all
test-all: ## run tests on every Python version with tox
	tox -r

.PHONY: coverage
coverage: ## check code coverage quickly with the default Python
	coverage run --source sintel -m pytest
	coverage report -m
	coverage html
	$(BROWSER) htmlcov/index.html

# -------------- session: coding style check ---------------- #

.PHONY: lint
lint: ## check style with flake8 and isort
	invoke lint

.PHONY: fix-lint
fix-lint: ## fix lint issues using autoflake, autopep8, and isort
	find sintel -name '*.py' | xargs autoflake --in-place --remove-all-unused-imports --remove-unused-variables
	autopep8 --in-place --recursive --aggressive sintel
	isort --apply --atomic --recursive sintel

	find tests -name '*.py' | xargs autoflake --in-place --remove-all-unused-imports --remove-unused-variables
	autopep8 --in-place --recursive --aggressive tests
	isort --apply --atomic --recursive tests


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
	   clean-logs clean-db

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

.PHONY: clean-db
clean-db:
	rm -f -r ./db-instance/data/*
	rm -f -r ./db-instance/log/*

.PHONY: checkdeps
checkdeps: # Save the currently installed versions of the dependencies as the latest versions
	$(eval allow_list='orion-ml|pymongo|mongoengine|gevent|Jinja2')
	pip freeze | grep -v "sintel-dev/sintel.git" | grep -E $(allow_list) > $(OUTPUT_PATH)
