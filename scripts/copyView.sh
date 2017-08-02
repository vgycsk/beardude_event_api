#!/bin/bash

#rm -rf .tmp/views
#rm -rf .tmp/public/js

# Copy view files

mkdir -p ./.tmp
mkdir -p ./.tmp/public
cp -R ./views .tmp/views
cp -R ./assets/js .tmp/public