var async = require('async')
  , template = require('../common/template')
  ;

exports.create = function(options, callback) {
  // We don't support dev mode with C++
  if (options.development) {
    return process.nextTick(function() {
      callback(new Error('Cannot compile CPP in dev mode'));
    });
  }

  return process.nextTick(function () {
    callback(undefined, {
     'foo.cpp': 'foo'
    });
  });
};
