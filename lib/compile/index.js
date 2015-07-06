require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , virgil = require('virgil')
  , util = require('../util')
  ;

exports.compileCard = function(options, language, callback) {
  var rootFilename = path.join(options.dir, 'src', 'main.vgl');
  var debug = options.debug || options.d || false;

  async.waterfall([
    // Read in root file
    function(callback) {
      fs.readFile(rootFilename, {encoding: 'utf8'}, function(err, body) {
        if (err) {
          console.error('Cannot compile, no ' + rootFilename + ' file for this card');
        }

        callback(undefined, body || '');
      });
    },

    // Do the compile
    function(src, callback) {
      virgil.compile(src, language, {
        filename: rootFilename,
        debug: debug,
        libs: util.parseLibs(options.libs),
        prune: options.prune,
        convert: {
          namespace: options.name.camelize(false),
          browserify: !!options.browserify,
        }
      }, callback);
    }
  ], callback)
};
