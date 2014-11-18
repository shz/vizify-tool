#!/usr/bin/env node

var command = process.argv[2];
var args = process.argv.slice(3);

require('../lib/run')(command, args);
