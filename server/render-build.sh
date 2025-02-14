#!/usr/bin/env bash
set -o errexit

npm install

PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
BUILD_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/chrome/

mkdir -p $PUPPETEER_CACHE_DIR
mkdir -p $BUILD_CACHE_DIR  # Ensure the build cache directory exists

npx puppeteer browsers install chrome

if [[ -d $PUPPETEER_CACHE_DIR && "$(ls -A $PUPPETEER_CACHE_DIR)" ]]; then
    echo "...Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR/* $BUILD_CACHE_DIR
else
    echo "...Copying Puppeteer Cache from Build Cache"
    cp -R $BUILD_CACHE_DIR/* $PUPPETEER_CACHE_DIR
fi

# npm install && npx puppeteer browsers install chrome