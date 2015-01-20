var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , card = require('../card')
  , compile = require('../compile')
  ;

module.exports = function(options) {
  // Normalize options
  options = {
    output: options.o || options.output || path.join(process.cwd(), 'output'),
    language: options._[0],
    dir: process.cwd(),
    debug: options.debug
  }

  if (!options.language) {
    console.error('Usage: vz compile javascript|cpp [-o|--ouput OUTPUT_DIR]');
    console.error('');
    process.exit(1);
  }

  async.waterfall([
    // Read card
    function(callback) {
      card.read(options.dir, callback);
    },

    // Compile card
    function(c, callback) {
      compile.compileCard({
        dir: options.dir,
        name: c.name
      }, options.language, callback);
    },

    // Write results
    function(files, callback) {
      async.each(Object.keys(files), function(f, callback) {
        var p = path.join(options.output, f);
        var d = path.dirname(p);

        mkdirp(d, function(err) {
          if (err) { console.log(err.stack) }
          fs.writeFile(p, files[f], callback);
        });
      }, callback);
    }
  ], function(err) {
    if (err) {
      console.error((options.debug ? err.stack : null) || err.message || err);
      return process.exit(1);
    }

    console.log('Compiled card to', options.output);
  });
};
module.exports.doc = 'Compiles a card and outputs result';
