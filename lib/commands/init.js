require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , template = require('../common/template')
  ;

/* istanbul ignore next */
var readLine = function(callback) {
  var chunks = [];

  var done = function() {
    done = null;

    var line = Buffer.concat(chunks).toString('utf8');
    process.stdin.removeListener('data', handler);
    callback(undefined, line);
  };

  var handler = function(c) {
    for (var i=0; i<c.length; i++) {
      if (c[i] == 0x0A) { // \n
        chunks.push(c.slice(0, i));
        if (done)
          done();
        break;
      }
    }
    chunks.push(c);
  };
  process.stdin.on('data', handler);
};

/* istanbul ignore next */
var prompt = function(thing, def, callback) {
  if (typeof def == 'function') {
    callback = def;
    def = undefined;
  }

  return function(callback) {
    process.stdout.write(thing + (def === undefined ? '' : ' (' + def + ')') + ': ');
    readLine(function(err, line) {
      if (!line.trim()) {
        line = def || '';
      }

      if (typeof def == 'number')
        line = parseFloat(line);
      callback(undefined, line);
    });
  };
};

/* istanbul ignore next */
module.exports = function(options) {
  var config = {
    data: {},
    editor: {}
  };

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
    prompt('Name', process.cwd().split(path.sep).last()),
    write('name'),

    prompt('Version', '1.0.0'),
    write('version'),

    prompt('Width', 300),
    write('size', 'width'),

    prompt('Height', 300),
    write('size', 'height'),

    // Write card.json
    function(callback) {
      fs.writeFile(path.join(process.cwd(), 'card.json'),
        JSON.stringify(config, null, 2), {encoding: 'utf8'}, callback);
    },

    // Create img/ directory
    function(callback) {
      fs.mkdir(path.join(process.cwd(), 'img'), callback)
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
