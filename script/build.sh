#!/bin/sh

./node_modules/.bin/browserify lib/commands/devel/client/index.js \
  --extension=.jsx \
  -t reactify \
  >lib/commands/devel/static/devel.js && echo Built JS
