#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

mkdir -p release
node_modules/.bin/browserify -t reactify ./client/boot.jsx -s boot -o release/show.js

success=$?

if [ $success -eq 0 ]; then
  echo "Build succeeded"
else
  echo "Build failed"
fi

exit $success
