require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , virgil = require('virgil')
  ;

exports.compileCard = function(options, language, callback) {
  var rootFilename = path.join(options.dir, 'src', 'main.vgl');
  var debug = options.debug || options.d || false;

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
        debug: debug,
        libs: [path.join(__dirname, '..', '..', 'src')],
        namespace: options.name.camelize(false)
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
