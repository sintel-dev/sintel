FROM node:latest

ADD . /client
WORKDIR /client

RUN npm install -g serve \
 && npm run clean \
 && npm install \
 && npm run build