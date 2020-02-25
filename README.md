<p align="left">
<img width=15% src="https://dai.lids.mit.edu/wp-content/uploads/2018/06/Logo_DAI_highres.png" alt=“DAI-Lab” />
<i>An open source project from Data to AI Lab at MIT.</i>
</p>

<!-- [![PyPI Shield](https://img.shields.io/pypi/v/mtv.svg)](https://pypi.python.org/pypi/mtv) -->
[![Build Status](https://travis-ci.com/dyuliu/mtv.svg?branch=master)](https://travis-ci.com/dyuliu/mtv)
[![Coverage Status](https://coveralls.io/repos/github/dyuliu/MTV/badge.svg)](https://coveralls.io/github/dyuliu/MTV)
[![Github All Releases](https://img.shields.io/github/downloads/dyuliu/MTV/total)](https://github.com/dyuliu/MTV/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/dyuliu/mtv)](https://hub.docker.com/r/dyuliu/mtv)

# MTV

**MTV** is a visual analytics system built for anomaly analysis of multiple time-series data.

The Restful APIs documentation: http://45.77.5.58/apidoc/



## License

[The MIT License](https://github.com/HDI-Project/MTV/blob/master/LICENSE)


## Before You Begin

Before you begin we recommend you read about the basic building blocks that assemble the **MTV**:

- **Python (>=3.0)** - MTV has been developed and runs on [Python 3.6](https://www.python.org/downloads/release/python-360/). Although it is not strictly required, the usage of a [virtualenv](https://virtualenv.pypa.io/en/latest/) is highly recommended in order to avoid interfering with other software installed in the system where **MTV** is run.
- **Flask (>=1.0.2)** - The best way to understand express is through its [Official Website](http://flask.pocoo.org/), which has a good [Tutorial](http://flask.pocoo.org/docs/1.0/tutorial/). We use [Flask-RESTful](https://flask-restful.readthedocs.io/en/latest/) as an extension of Flask to quickly build [REST APIs](https://www.restapitutorial.com/).
- **Typescript (>=3.0)** - Typescript's [Official Documentation](https://www.typescriptlang.org/docs/home.html) is a great starting point.
- **MongoDB (>=3.6)** - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.



## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- **Git** - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.

- **Node.js (>= 10.0.0)** - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. Make sure to install gulp-cli globally after the installation of Node.js.

  ```bash
  $ npm install --quiet -g gulp-cli
  ```

- **MongoDB** - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).



## Get Started

### Downloading MTV

##### Cloning from Github

The recommended way to get MTV is to use git to directly clone the MTV repository:

```bash
$ git clone https://github.com/HDI-Project/MTV mtv
```

This will clone the latest version of the MTV repository to a **mtv** folder.

##### Downloading the zip file

Another way to use the MTV is to download a zip copy from the [master branch on GitHub](https://github.com/HDI-Project/MTV/archive/master.zip). You can also do this using the `wget` command:

```bash
$ wget https://github.com/HDI-Project/MTV/archive/master.zip -O mtv.zip
$ unzip mtv.zip
$ rm mtv.zip
```

Don't forget to rename **mtv-master** after your project name.



### Quick Install

Once you've downloaded the MTV repository and installed all the prerequisites, you're just a few steps away from running your application. To install the project, create a virtualenv and execute

```bash
$ make install
```

This command will install all the dependencies needed for the application (server-end and client-end) to run. For development, use the following command instead, which will install some additional
dependencies for code linting and testing

```bash
$ make install-develop
```



### Data

##### Downloading the demo data

```bash
$ make load-db-mtv
```

This will download and restore the dataset into MongoDB.

##### Working with Orion to generate your own data

Once the required data is generated using Orion, you simple type the following command to sync the data from Orion to MTV. Note that you can configure the mongodb in the file `./mtv/config.yaml`.

```bash
$ mtv update db -v
```



### Running Your Application

Please activate your virtualenv for MTV first, and then use the following command to run the application.

```bash
$ mtv run -v
```

Your application should run on **port 3000** with the ***production*** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your browser (Chrome). The following list the optional arguments for `mtv run`

```
usage: mtv run [-h] [-l LOGFILE] [-v] [-P PORT] [-E ENV]

optional arguments:
  -h, --help             show this help message and exit
  -l, --logfile LOGFILE  Name of the logfile. If not given, log to stdout.
  -v, --verbose          Be verbose. Use -vv for increased verbosity.
  -P PORT, --port PORT   Flask server port
  -E ENV, --env ENV      Flask environment
```



### Development

The server-end code and client-end code are in two separate folders, namely,` <project-home>/mtv` and `<project-home>/client` 

Run the following command for server-end development

```bash
$ mtv run -E development -v
```

Run the following command for client-end development

```bash
$ cd client
$ gulp
```



## Production deploy with Docker

- Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

- Load data into the mongo container

  ```bash
  $ make docker-db-up
  ```

- Run the application

  ```bash
  $ docker-compose up -d
  ```

  The application should be successfully running on **port 3000** using the **production** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your chrome browser to start your exploration.

  **Note:** if MTV is deployed in a remote server, please change the variable `server` in `.client/src/config.ts` to the server IP address with right port.

- Stop the application

  ```bash
  $ docker-compose stop
  ```

- Remove the related containers and volumes (optional step)

  ```bash
  $ docker-compose down -v
  ```

  

## Production deploy in local secure environment

- Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

- Download MTV project and put the MTV docker image into the project direction 

- Enter the MTV folder and install the docker image by running

  ```bash
  $ docker load --input mtv.tar
  Loaded image: dyuliu/mtv:latest
  Loaded image: mongo:4.0
  ```

- Restore data back to database running on mongo:4.0 container

  ```bash
  $ docker-compose -f docker-compose-db.yml up
  ```

- Run the application. Please check the file `docker-compose.yml` and make sure line 18 (`build: .`) is **commented** and line 17 (`image: dyuliu/mtv`) is **uncommented**.

  ```bash
  $ docker-compose up -d
  ```

  Your application should run on **port 3000** with the ***production*** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your browser to start your exploration.

- Stop the application

  ```bash
  $ docker-compose stop
  ```
