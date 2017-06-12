#!/bin/bash
echo "Packaging Distribution Build"

mkdir ./dist/dist
mv ./dist/assets ./dist/dist/assets
mv ./dist/index.html ./dist/dist/
cp -R ./node_modules/ ./dist/node_modules
cp package.json ./dist/
