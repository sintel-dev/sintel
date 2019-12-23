
## MTV client

The front-end of MTV is developed by [TypeScript](http://www.typescriptlang.org/). It includes multiple novel visualizations for anomaly analysis of multiple time-series data. Users can do labeling work through an easy interaction. The labels would be collected and feed back to the models for enhancing the model performances.


## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.



After installing these tools, please go to $PROJECT_ROOT and run:
```
npm install --global gulp-cli webpack-cli
```

## Running your application

To generate the client/public/dist
```
gulp dev
```
or choose to generate it in production mode
```
gulp prod
```
by default, run gulp without any args will keep the gulp watching the changes of the src files
```
gulp
```

## Folders

### client

Client-side code and associated files relating to the specific module.

- a set of configuration files: gulpfile.js -> gulp, package.json -> npm, tslint.json & tsconfig.json -> typescript, karma.conf.js -> karma test (not used yet), bower.json -> bower
- index.html: you know what it is.

#### client/src

the section holds all the typescript source files and less style files.

- main.ts: the entry of the front-end modules
- style.less: the global style file
- overrides.d.ts: the typescript definition files

##### client/src/components


##### client/src/services

- pip-client: communication among client modules
- pip-server: communicating with server through restful API


#### client/public

- client/public/dist: gulp will compile all the typescript source codes and less files, then build them over here
- client/public/libs: the bower packages will go here
- client/public/theme: theme related css and js files (todo: need to be integrated into our app better)
- client/public/manual_libs: manual installed lib