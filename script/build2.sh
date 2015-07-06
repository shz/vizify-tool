#!/bin/sh

./node_modules/.bin/browserify lib/commands/devel2/client/index.js \
  --extension=.jsx \
  -t reactify \
  >lib/commands/devel2/static/devel.js && echo Built JS
