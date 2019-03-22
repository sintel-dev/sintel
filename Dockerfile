# Command Help
# Build:
# docker build -t HDI-Project/MTV .
#
# Run:
# docker run -it HDI-Project/MTV
#
# Compose:
# docker-compose up -d


# start from base
FROM ubuntu:latest
LABEL maintainer="Dongyu Liu <windliudy@gmail.com>"


# install utilities
RUN apt-get update -yqq  \
 && apt-get install -yqq \
 unzip \
 curl \
 git \
 ssh \
 gcc \
 make \
 build-essential \
 libkrb5-dev \
 sudo \
 apt-utils


# install python
RUN apt-get install -y python3-pip python3-dev \
 && cd /usr/local/bin \
 && ln -s /usr/bin/python3 python \
 && pip3 install --upgrade pip
# install node
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# install global npm packages
RUN npm install --quiet -g gulp-cli


# copy our application code
ADD . /mtv
WORKDIR /mtv

# install application packages for python and node
RUN make install-theme
RUN make install



# Set system environment variables if any
# e.g., ENV NODE_ENV development

# 80 = HTTP, 443 = HTTPS, 3000 = MTV server
# EXPOSE 80 443 3000

# start app
# CMD [ "python", "./run-server.py" ]
