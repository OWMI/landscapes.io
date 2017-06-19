#!/bin/bash
echo "Configuring landscapes..."

# set environment variables
DNS_NAME=$(env | grep DNS_NAME | grep -oe '[^=]*$');
SERVER_PORT=$(env | grep DNS_PORT | grep -oe '[^=]*$');

# fallback if environment variables not set
SERVER_IP=${DNS_NAME:=0.0.0.0}
SERVER_PORT=${DNS_PORT:=8080}

echo "using DNS_NAME " $SERVER_IP
echo "using PORT " $SERVER_PORT

# search and replace dns
sed -i -e "s/\:\/\/0.0.0.0:80/\:\/\/${SERVER_IP}\:${SERVER_PORT}/g" /opt/landscapes/dist/dist/assets/bundle.js
