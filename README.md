<p align="left">
<img width=15% src="https://dai.lids.mit.edu/wp-content/uploads/2018/06/Logo_DAI_highres.png" alt=“DAI-Lab” />
<i>An open source project from Data to AI Lab at MIT.</i>
</p>

[![Development Status](https://img.shields.io/badge/Development%20Status-2%20--%20Pre--Alpha-yellow)](https://pypi.org/search/?c=Development+Status+%3A%3A+2+-+Pre-Alpha)
[![PyPI Shield](https://img.shields.io/pypi/v/sintel.svg)](https://pypi.python.org/pypi/sintel)
[![Github Workflow Status](https://img.shields.io/github/workflow/status/signals-dev/sintel/CI)](https://github.com/signals-dev/sintel/actions)
<!-- [![Travis CI Shield](https://travis-ci.org/signals-dev/sintel.svg?branch=master)](https://travis-ci.org/signals-dev/sintel) -->
[![Coverage Status](https://codecov.io/gh/signals-dev/sintel/branch/master/graph/badge.svg?token=WwM2IJURrq)](https://codecov.io/gh/signals-dev/sintel)
[![Downloads](https://pepy.tech/badge/sintel)](https://pepy.tech/project/sintel)
<!-- [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/signals-dev/sintel/master?filepath=tutorials) -->
# Sintel

**Sintel** (Signal Intelligence) provides Restful APIs to process massive signal data for anomaly analysis in an efficient and user-friendly way.

* License: [MIT](https://github.com/signals-dev/sintel/blob/master/LICENSE)
* Development Status: [Pre-Alpha](https://pypi.org/search/?c=Development+Status+%3A%3A+2+-+Pre-Alpha)
* Homepage: https://github.com/signals-dev/sintel
* Documentation:
    * http://mtv.lids.mit.edu:3000/apidocs (Swagger UI style)
    * http://mtv.lids.mit.edu:3000/redoc (Redoc UI style)


## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

-   **Python (>= 3.0)** - Sintel has been developed and runs on [Python 3.6](https://www.python.org/downloads/release/python-360/). Although it is not strictly required, the usage of a [virtualenv](https://virtualenv.pypa.io/en/latest/) is highly recommended in order to avoid interfering with other software installed in the system where **MTV** is run. To this end, [Anaconda python](https://www.anaconda.com/distribution/#download-section) is suggested to maintain the virtual environments.
-   **Git** - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
-   **MongoDB (>= 3.6)** - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).

## Get Started


### Quick Install

Once you've downloaded the Sintel repository and installed all the prerequisites, you're just a few steps away from running your application. To install the project, create a virtualenv and execute

```bash
$ make install
```

This command will install all the dependencies needed for the application to run. For development, use the following command instead, which will install some additional
dependencies for code linting and testing

```bash
$ make install-develop
```

### Running Your Application

Please activate your virtualenv, and then launch the API server:

```bash
$ sintel run -v
```

Go to the API playground ([http://localhost:3000/apidocs](http://localhost:3000/apidocs)) to have a try.

### Development

Run the following command for the purpose of development

```bash
$ sintel run -E development -v
```

### Data

The command `make install` or `make install-develop` has already pull the demo dataset and restore it into MongoDB. The database name by default is `sintel`.

##### Working with [Orion](https://github.com/D3-AI/Orion) to generate your own data

You can type the following command to update the data from Orion to Sintel-supported formats. Note that you can configure the mongodb in the file `./sintel/config.yaml`.

```bash
$ mtv update db -v
```


## Use Docker to deploy

-   Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

-   Load data into the mongo container

    ```bash
    $ make docker-db-up
    ```

    ```bash
    $ make docker-up
    ```

Go to the API playground ([http://localhost:3000/apidocs](http://localhost:3000/apidocs)) to have a try. For further commands, please refer to `Makefile`, the session of Docker Installation.
