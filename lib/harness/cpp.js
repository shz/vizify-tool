var async = require('async')
  , template = require('../common/template')
  ;

exports.create = function(options, callback) {
  // TODO - Static images, fonts

  return process.nextTick(function () {
    callback(undefined, {
     'foo.cpp': 'foo'
    });
  });
};
