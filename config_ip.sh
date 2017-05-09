#!/bin/bash
echo "Configuring landscapes..."

# set environment variables
DNS_NAME=$(env | grep DNS_NAME | grep -oe '[^=]*$');
IP=${DNS_NAME:=127.0.0.1}

echo $IP

# search and replace dns
sed -i -e "s/\:\/\/0.0.0.0/\:\/\/${IP}/g" /opt/landscapes/dist/dist/assets/bundle.js

# sed -i -e "s/host\: DNS_NAME/\:\/\/host\: ${IP}/g" dist/server/config/env/default.js
