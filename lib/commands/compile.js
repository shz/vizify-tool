var fs = require('fs')
  , path = require('path')
  , childProcess = require('child_process')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , virgil = require('virgil')
  , util = require('../util')
  ;

/* istanbul ignore next */
module.exports = function(vizData, options) {
  // Normalize options
  var language = options._[0];
  var output = options.output;
  options = {
    libs: options.libs,
    debug: !!options.debug,
    pack: !!options.pack,
  };

  // Sanity check
  if (!language) {
    console.error(usage);
    console.error('');
    process.exit(1);
  }
  try {
    vizData.assert({
      hasMain: true,
      hasJSON: true
    });
  } catch (err) {
    process.error(err.message);
    process.exit(1);
  }

  async.waterfall([
    // Compile card
    function(callback) {
      vizData.compile(language, options, callback);
    },

    // Write results
    function(files, callback) {
      async.each(Object.keys(files), function(f, callback) {
        var p = path.join(output, f);
        var d = path.dirname(p);

        mkdirp(d, function(err) {
          fs.writeFile(p, files[f], callback);
        });
      }, callback);
    },

  ], function(err) {
    if (err) {
      if (err.filename) {
        virgil.support.errors.printErrorContext(err);
      } else {
        console.error((options.debug ? err.stack : null) || err.message || err);
      }
      return process.exit(1);
    }

    console.log('Compiled card to', output);
  });
};

module.exports.doc = 'Compiles a card and outputs result' +
  '\n\tUsage: vz compile javascript|cpp [-o|--output OUTPUT_DIR] [--libs LIBS] [--pack]';

module.exports.argParserOpts = {
  string: ['libs', 'output'],
  boolean: ['pack'],
  default: {
    output: path.join(process.cwd(), 'output'),
  },
  alias: {
    output: 'o',
  }
};
