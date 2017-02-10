# Build:
# docker build -t landscapes .
#
# Run:
# docker run -it landscapes

FROM node:6
MAINTAINER BlackSky 

# 3000=landscapes, 8080=Node.js/GraphQL
EXPOSE 3000 8080

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
 libkrb5-dev \
 sudo \
 apt-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /opt/landscapes/public/lib

WORKDIR /opt/landscapes

COPY . /opt/landscapes

RUN npm install --quiet && npm cache clean

RUN npm run build

ENV MONGO_SEED true

CMD ["npm", "run", "prod"]
