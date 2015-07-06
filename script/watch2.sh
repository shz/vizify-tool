#!/bin/sh

./node_modules/.bin/watchify lib/commands/devel2/client/index.js \
  --extension=.jsx \
  -t reactify \
  -o 'exorcist lib/commands/devel2/static/devel.js.map >lib/commands/devel2/static/devel.js && echo Built JS' \
  -d
