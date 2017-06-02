./node_modules/.bin/eslint --env browser --env node --ignore-path .eslintignore api/**/*.js assets/**/*.js assets/**/*.jsx config/**/*.js test/**/*.js test/**/*.spec.js *.js


mkdir -p build;./node_modules/.bin/eslint --env browser --env node --ignore-path .eslintignore -f checkstyle -o build/checkstyle-result.xml api/**/*.js config/**/*.js  test/**/*.js test/**/*.spec.js test/**/*.js *.js