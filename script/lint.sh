#!/bin/sh

export FILE_COUNT=`find lib -name "*.js" | wc -l | tr -d ' '`

if [ -n "$LINT_OUTPUT_DIR" ]; then
  rm -rf ./$LINT_OUTPUT_DIR/*
  node_modules/.bin/jshint lib --reporter ./test/util/jshint_reporter >"$LINT_OUTPUT_DIR/yhint.json"
else
  node_modules/.bin/jshint lib
fi

