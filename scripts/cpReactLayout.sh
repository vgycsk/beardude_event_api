#!/bin/bash

# Copy JS files
cp -r .tmp/public/js/console/sharePage.ejs .tmp/views/;
./node_modules/.bin/webpack --progress;
