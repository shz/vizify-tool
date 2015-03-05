#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

mkdir -p release
start=`date +%s`
node_modules/.bin/browserify -t reactify ./client/boot.jsx -g aliasify -s boot -o release/show.js
end=`date +%s`
duration=$((end - start))

success=$?

if [ $success -eq 0 ]; then
  echo "\x1B[32mBuild succeeded\x1B[0m (${duration}s)"
else
  echo "\x1B[31mBuild failed\x1B[0m"
fi

exit $success
