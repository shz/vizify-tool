var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , virgil = require('virgil')
  ;

exports.compileCard = function(dir, language, callback) {
  var rootFilename = path.join(dir, 'src', 'main.vgl');

  async.waterfall([
    // Read in root file
    function(callback) {
      fs.readFile(rootFilename, {encoding: 'utf8'}, function(err, body) {
        if (err) {
          return callback(new Error('Cannot compile, no ' + rootFilename + ' file for this card'));
        }

        callback(undefined, body);
      });
    },

    // Do the compile
    function(src, callback) {
      virgil.compileModule(rootFilename, src, language, {
        debug: false,
        libs: ['/Users/lpstein/Development/Yahoo/vizify-virgil']
      }, callback);
    }
  ], function(err, output, world) {
    if (err) {
      return callback(err);
    }

    // TODO - Check that main.vgl exports the required functions

    return callback(undefined, output);
  })
};
