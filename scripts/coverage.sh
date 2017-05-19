mkdir -p build/coverage;
./node_modules/.bin/istanbul cover --include-all-sources -x "*.js" -x "config/**/*.js" -x "tasks/**/*.js" -x "api/responses/*.js" -x "api/models/*.js" -x "assets/js/dependencies/*" --report lcov --report cobertura --dir build/coverage ./node_modules/.bin/_mocha -- -R spec test/bootstrap.test.js test/**/*.spec.js