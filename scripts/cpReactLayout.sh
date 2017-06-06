#!/bin/bash

# Copy JS files
cp -r .tmp/public/js/console/sharePage.ejs views/;
./node_modules/.bin/webpack --progress;
