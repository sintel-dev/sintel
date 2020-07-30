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

The Restful APIs documentation: http://mtv.lids.mit.edu:8080/



## License

[The MIT License](https://github.com/HDI-Project/MTV/blob/master/LICENSE)


## Before You Begin

Before you begin we recommend you read about the basic building blocks that assemble the **MTV**:

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
- **Python (>=3.0)** - MTV has been developed and runs on [Python 3.6](https://www.python.org/downloads/release/python-360/). Although it is not strictly required, the usage of a [virtualenv](https://virtualenv.pypa.io/en/latest/) is highly recommended in order to avoid interfering with other software installed in the system where **MTV** is run. To this end, [Anaconda python](https://www.anaconda.com/distribution/#download-section) is suggested to maintain the virtual environments. 
- **Git** - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
- **Node.js (>= 10.0.0)** - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. Make sure to install gulp-cli globally after the installation of Node.js.
- **MongoDB (>= 3.6)** - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).

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

This command will install all the dependencies needed for the application (server-end) to run. For development, use the following command instead, which will install some additional
dependencies for code linting and testing

```bash
$ make install-develop
```

### Running Your Application

Please activate your virtualenv for MTV first, and then launch the server and the client:

```bash
$ mtv run -v
```

Then launch the client:
```bash
$ npm -C client run serve
```
Your application should run on **port 4200** with the ***production*** environment by default. Just go to [http://localhost:4200](http://localhost:4200) in your browser (Chrome recommended).



### Development

The server-end code and client-end code are in two separate folders, namely,`<project-home>/mtv` and `<project-home>/client`

Run the following command for server-end development

```bash
$ mtv run -E development -v
```

Run the following command for client-end development

```bash
$ npm -C client start
```

### Data

The command `make install` or `make install-develop` has already pull the demo dataset and restore it into MongoDB. The database name by default is `mtv`. 

##### Working with [Orion](https://github.com/D3-AI/Orion) to generate your own data

You can type the following command to update the data from Orion to MTV-supported formats. Note that you can configure the mongodb in the file `./mtv/config.yaml`.

```bash
$ mtv update db -v
```


## Production deploy with Docker

- Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

- Load data into the mongo container

  ```bash
  $ make docker-db-up
  ```

- Run the application

  ```bash
  $ make docker-up
  ```

  The application should be successfully running on **port 4200** using the **production** environment by default. Just go to [http://localhost:4200](http://localhost:4200) in your chrome browser to start your exploration.

  **Note:** if MTV is deployed in a remote server, please change the variable `server` in `.client/src/config.ts` to the server IP address with right port.

  For further commands, please refer to `Makefile`, the session of Docker Installation. 

## Production deploy with Docker in local secure environment

- Download `mtv.zip`, unzip it, and enter the directory. The directory contains the source code of mtv; under the home directory, there is one file named `mtv.tar` which is the exported docker container's filesystem for mtv. Also, the MongoDB data is also ready under the folder `<project-home>/db-instance/data/`

- Under the project home directory, install the mtv docker images:

  ```bash
  $ docker load --input mtv.tar
  ```

- Then restore data back to database:

  ```bash
  $ docker-compose -f docker-compose-db.yml up
  ```

- Finally start the application:
  ```bash
  $ docker-compose up --no-build -d
  ```

  Your application should run on **port 4200** with the ***production*** environment by default. Just go to [http://localhost:4200](http://localhost:4200) in your browser to start your exploration.

## Additional Resources
  - [Install python Mac OS](https://www.python.org/downloads/mac-osx/)
  - [Install python Ubuntu](https://linuxize.com/post/how-to-install-python-3-7-on-ubuntu-18-04/)
  - [Install anaconda](https://docs.anaconda.com/anaconda/install/)
  - [Install python virtual environment](https://virtualenv.pypa.io/en/latest/)
