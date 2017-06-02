#!/bin/bash

# Prepare build folders
rm -rf build/images; mkdir -p build/images;
rm -rf build/styles; mkdir -p build/styles;

# Copy images to build folder
cp -r ./assets/images/ build/images;

# Build CSS along with sourcemap
./node_modules/.bin/lessc --source-map=./build/styles/prod.map --source-map-less-inline assets/styles/prod.less ./build/styles/prod.css;

# Create public folders and copy built files
mkdir -p .tmp/public/styles;
mkdir -p .tmp/public/images;
cp -r build/styles/ .tmp/public/styles;
cp -r build/images/ .tmp/public/images;