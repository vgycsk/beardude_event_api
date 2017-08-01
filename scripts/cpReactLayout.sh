#!/bin/bash

# Copy JS files
./node_modules/.bin/webpack --config ./webpack.config.prod.js --progress;
cp -r .tmp/public/js/console/sharePage.ejs .tmp/views/;