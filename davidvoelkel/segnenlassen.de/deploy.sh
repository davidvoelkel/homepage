#!/bin/bash
set -x -e
npm run build
cp dist/* ../../../davidvoelkel.github.io/dist/
cd ../../../davidvoelkel.github.io/
git add .
git commit -m "deploy"
git push
