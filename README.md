[![PyPI Shield](https://img.shields.io/pypi/v/mtv.svg)](https://pypi.python.org/pypi/mtv)
[![Travis CI Shield](https://travis-ci.org/liudy1991/mtv.svg?branch=master)](https://travis-ci.org/liudy1991/mtv)

# MTV

**MTV** is a visual analytics system built for anomaly analysis of multiple time-series data.



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
$ make install-theme
```

This command will install all the dependencies needed for the application (server-end and client-end) to run. For development, use the following command instead, which will install some additional
dependencies for code linting and testing

```bash
$ make install-develop
$ make install-theme
```



### Data

##### Downloading the NASA public data for demo

```bash
$ make init-db
$ make load-db-nasa
```

This will download and restore the dataset into MongoDB.

##### Using your own data

You have to create a database with the name **"mtv"** in MongoDB. For the detailed data format in the database, you can refer to the demo data after executing the aforementioned command.



### Running Your Application

Please activate your virtualenv for MTV first, and then use the following command to run the application.

```bash
$ mtv run -v
```

Your application should run on **port 3000** with the ***production*** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your browser. The following list the optional arguments for `mtv run`

```
usage: mtv run [-h] [-l LOGFILE] [-v] [-P PORT] [-E ENV]

optional arguments:
  -h, --help            show this help message and exit
  -l LOGFILE, --logfile LOGFILE
                        Name of the logfile. If not given, log to stdout.
  -v, --verbose         Be verbose. Use -vv for increased verbosity.
  -P PORT, --port PORT  Flask server port
  -E ENV, --env ENV     Flask environment
```



### Development

The server-end code and client-end code are in two separate folders, namely, \<project-home>/mtv and \<project-home>/client. 

Run the following command for server-end development

```bash
$ mtv run -E development -v
```

Run the following command for client-end development

```bash
$ cd client
$ gulp
```



### Testing

to be added



## Production deploy with Docker

- Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

- Initialize MongoDB folders

  ```bash
  $ make init-db
  ```

- Restore data to the docker image "mongo:4.0" (here takes NASA data as example). 

  ```bash
  $ curl -o mtv_nasa.tar.bz2 "http://dongyu.name/data/mtv_nasa.tar.bz2"
  $ tar -xvf mtv_nasa.tar.bz2 -C ./db-instance/dump/ && rm mtv_nasa.tar.bz2
  $ mv ./db-instance/dump/mtv_nasa ./db-instance/dump/mtv
  $ docker-compose -f docker-compose-db.yml up
  ```

  If you want to use your personal data, please unzip your data dumped from MongoDB to the folder `db-instance/dump/mtv/` and use the following command to restore data:

  ```bash
  $ docker-compose -f docker-compose-db.yml up
  ```

- Running up the application. Please check the file `docker-compose.yml` under the ProjectRoot and make sure line 18 (`build: .`) is **uncommented** and line 17 (`image: dyuliu/mtv`) is **commented**.

  ```bash
  $ docker-compose up -d
  ```

  Your application should run on **port 3000** with the ***production*** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your browser to start your exploration.

- Stopping the application

  ```bash
  $ docker-compose down
  ```



## Production deploy in local secure environment

- Install [Docker](https://docs.docker.com/install/) and [Compose](https://docs.docker.com/compose/install/)

- Download MTV project and **enter the project directory**

- Download required docker images and then load them by running the following commands. **If you have installed MTV docker images before**, please firstly run `make clean-docker`.

  ```bash
  $ docker load --input mtv.tar
  Loaded image: dyuliu/mtv:latest
  Loaded image: mongo:4.0
  ```

- Restore data to the docker image "mongo:4.0"

  ```bash
  $ docker-compose -f docker-compose-db.yml up
  ```

- Running up the application. Please check the file `docker-compose.yml` under the ProjectRoot and make sure line 18 (`build: .`) is **commented** and line 17 (`image: dyuliu/mtv`) is **uncommented**.

  ```bash
  $ docker-compose up -d
  ```

  Your application should run on **port 3000** with the ***production*** environment by default. Just go to [http://localhost:3000](http://localhost:3000) in your browser to start your exploration.

- Stopping the application

  ```bash
  $ docker-compose down
  ```
