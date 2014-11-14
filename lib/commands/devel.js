var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , async = require('async')
  , virgil = require('virgil')
  , harness = require('../harness')
  ;

var checkCardJson = function(options, callback) {
  // TODO
  callback();
};
var checkSourceDir = function(options, callback) {
  // TODO
  callback();
};

module.exports = function(options) {
  // Normalize options
  options = {
    dir: options.dir || process.cwd(),
    port: parseInt(options.port || 3000, 10)
  };

  // Sanity check
  async.parallel([
    checkCardJson.bind(this, options),
    checkSourceDir.bind(this, options)
  ], function(err) {
    // Error messages will be handled by the appropriate
    // check function.
    if (err) return;

    // Start up our dev server
  })
};
