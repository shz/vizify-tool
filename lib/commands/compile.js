var fs = require('fs')
  , path = require('path')
  , childProcess = require('child_process')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , card = require('../card')
  , compile = require('../compile')
  , util = require('../util')
  ;

var usage = 'Usage: vz compile javascript|cpp [--libs LIB_PATH] [-o|--ouput OUTPUT_DIR] [--browserify] [--no-demo]';

module.exports = function(options) {
  // Normalize options
  options = {
    output: options.o || options.output || path.join(process.cwd(), 'output'),
    language: options._[0],
    dir: process.cwd(),
    libs: options.libs,
    debug: options.debug,
    browserify: options.browserify,
    demo: options.demo
  };

  if (!options.language) {
    console.error(usage);
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
        name: c.name,
        libs: options.libs,
        browserify: options.browserify
      }, options.language, callback);
    },

    // Write results
    function(files, callback) {
      async.each(Object.keys(files), function(f, callback) {
        var p = path.join(options.output, f);
        var d = path.dirname(p);

        mkdirp(d, function(err) {
          fs.writeFile(p, files[f], callback);
        });
      }, callback);
    },

    // Drop the demo functionality in, unless told not to
    function(callback) {
      if (!options.demo || language != 'cpp') {
        return callback();
      }

      var cmdPath = path.join(__dirname, '..', '..', 'src', 'vizify-cpp', 'script', 'drop_demo.sh');

      childProcess.exec(cmdPath + ' ' + options.output, function(err, stdout, stderr) {
        if (err) {
          return callback(err);
        }
        if (stderr && stderr.length) {
          return callback(new Error('Failed to deploy demo: ' + stderr.toString()));
        }

        return callback();
      });
    }
  ], function(err) {
    if (err) {
      console.error((options.debug ? err.stack : null) || err.message || err);
      return process.exit(1);
    }

    console.log('Compiled card to', options.output);
  });
};
module.exports.doc = 'Compiles a card and outputs result' +
  '\n\t' + usage;
