#!/bin/sh

./node_modules/.bin/watchify lib/commands/devel/client/index.js \
  --extension=.jsx \
  -t reactify \
  -o 'exorcist lib/commands/devel/static/devel.js.map >lib/commands/devel/static/devel.js && echo Built JS' \
  -d \
  & \
./node_modules/.bin/stylus -w lib/commands/devel/client/style/index.styl \
  -o lib/commands/devel/static/devel.css
