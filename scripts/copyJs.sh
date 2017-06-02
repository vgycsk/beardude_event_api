#!/bin/bash

# Copy JS files
cp -r ./assets/js/ .tmp/public/js;
./node_modules/.bin/webpack --progress;