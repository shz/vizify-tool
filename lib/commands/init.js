require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , conio = require('../util/conio').stdio
  ;

/* istanbul ignore next */
module.exports = function(vizData, options) {
  var config = {
    data: {},
    editor: {},
    size: {
      resizingMode: "contain"
    }
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

  if (vizData.hasMain) {
    console.error('Cannot initialize a new viz, main.vgl already exists');
    process.exit(1);
  }
  if (vizData.hasJSON) {
    console.error('Cannot initialize a new viz, vizify.json already exists');
    process.exit(1);
  }

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
      fs.writeFile(path.join(process.cwd(), 'vizify.json'),
        JSON.stringify(config, null, 2) + '\n', {encoding: 'utf8'}, callback);
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
      fs.readFile(path.join(__dirname, 'init.vgl'), function(err, src) {
        if (err) return callback(err);
        fs.writeFile(path.join(process.cwd(), 'src', 'main.vgl'), src, callback);
      });
    },

    // Create data-schema.json sample
    function(callback) {
      fs.readfile(path.join(__dirname, 'data-schema.json'), function(err, src) {
        if (err) return callback(err);
        fs.writeFile(path.join(process.cwd(), 'data-schema.json'), src, callback);
      });
    },

    // Create readme
    function(callback) {
      fs.writeFile(path.join(process.cwd(), 'readme.md'), '# ' + config.name + '\n', callback)
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
