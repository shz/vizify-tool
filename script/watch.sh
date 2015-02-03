#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

node_modules/.bin/supervisor -w client/ -e 'node,js,jsx' -x sh -n exit -q script/build.sh
