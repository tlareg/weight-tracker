#!/usr/bin/env sh

rm -rf ./dist

# deploy on gh-pages: https://vitejs.dev/guide/static-deploy.html#github-pages

# abort on errors
set -e

# build
yarn build

cd dist

git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'

# deploying to https://tlareg.github.io/weight-tracker
git push -f https://github.com/tlareg/weight-tracker.git gh-pages:gh-pages

cd -