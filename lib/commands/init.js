require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , template = require('../common/template')
  , conio = require('../util/conio').stdio
  ;

/* istanbul ignore next */
module.exports = function(options) {
  var config = {
    data: {},
    editor: {}
  };

  var prompt = conio.prompt.bind(conio);

  var write = function() {
    var parts = Array.prototype.slice.call(arguments);

    return function(val, callback) {
      var cur = config;

      while (parts.length > 1) {
        if (!cur[parts[0]])
          cur[parts[0]] = {};
        cur = cur[parts.shift()];
      }

      cur[parts[0]] = val;
      callback();
    }
  };

  async.waterfall([
    prompt.bind(null, 'Name', process.cwd().split(path.sep).last()),
    write('name'),

    prompt.bind(null, 'Version', '1.0.0'),
    write('version'),

    prompt.bind(null, 'Width', 300),
    write('size', 'width'),

    prompt.bind(null, 'Height', 300),
    write('size', 'height'),

    // Validate
    function(callback) {
      if (config.name == 'vizify') {
        console.error('Cannot name card "vizify", aborting');
        process.exit(1);
      }

      callback();
    },

    // Write card.json
    function(callback) {
      fs.writeFile(path.join(process.cwd(), 'card.json'),
        JSON.stringify(config, null, 2), {encoding: 'utf8'}, callback);
    },

    // Create img/ directory
    function(callback) {
      fs.mkdir(path.join(process.cwd(), 'img'), callback)
    },

    // Create sample-data/ directory
    function(callback) {
      fs.mkdir(path.join(process.cwd(), 'sample-data'), callback)
    },

    // Create src/ directory
    function(callback) {
      fs.mkdir(path.join(process.cwd(), 'src'), callback);
    },

    // Create src/main.vgl boilerplate
    function(callback) {
      template.render('init.vgl', {}, function(err, src) {
        if (err) return callback(err);

        fs.writeFile(path.join(process.cwd(), 'src', 'main.vgl'),
          src, {encoding: 'utf8'}, callback);
      });
    }

  ], function(err) {
    if (err) {
      console.error('Failed to scaffold card:', err.message);
      process.exit(1);
    }

    console.log('Success');
    process.exit(0);
  });
};
module.exports.doc = 'Scaffold a Vizify card in the current directory';
