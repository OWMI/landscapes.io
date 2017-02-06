# Build:
# docker build -t landscapes .
#
# Run:
# docker run -it landscapes

FROM node:6
MAINTAINER BlackSky 

# 80=HTTP, 443=HTTPS, 3000=landscapes, 35729=livereload
EXPOSE 80 443 3000 35729

# Set development environment as default
ENV NODE_ENV development

# Install Utilities
RUN apt-get update -q  \
 && apt-get install -yqq curl \
 wget \
 aptitude \
 htop \
 vim \
 git \
 traceroute \
 dnsutils \
 curl \
 ssh \
 tree \
 tcpdump \
 psmisc \
 gcc \
 make \
 build-essential \
 libfreetype6 \
 libfontconfig \
 libkrb5-dev \
 ruby \
 sudo \
 apt-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install gem sass for grunt-contrib-sass
RUN gem install sass

# Install Prerequisites
RUN npm install --quiet -g gulp && npm cache clean

RUN mkdir -p /opt/landscapes/public/lib
WORKDIR /opt/landscapes

# Copies the local package.json file to the container
# and utilities docker container cache to not needing to rebuild
# and install node_modules/ everytime we build the docker, but only
# when the local package.json file changes.
COPY package.json /opt/landscapes/package.json

# Install npm packages
RUN npm install --quiet && npm cache clean

COPY . /opt/landscapes

ENV MONGO_SEED true

CMD ["npm", "start"]
