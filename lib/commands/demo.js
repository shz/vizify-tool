var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , card = require('../card')
  , compile = require('../compile')
  , util = require('../util')
  ;

var usage = 'Usage: vz demo [-d|--datafile DATA_FILE] [--libs LIB_PATH] [-o|--output OUTPUT_DIR] [-p|--publish]';

var handleError = function(err) {
  var message = '';

  if (err.src && err.filename && err.start && err.end) {
    message = 'Error in ' + err.filename + ': ' + err.message + '\n\n';
    var lines = err.src.split(/\r?\n/);
    var start = Math.max(0, err.start.line - 5);
    var end = Math.min(lines.length, err.end.line + 5) - 1;
    var gutterSize = (end + 1).toString().length + 2;

    for (var i = start; i < end; i++) {
      var line = (i + 1).toString().pad(gutterSize) + '| ' + lines[i] + '\n';
      if (i + 1 >= err.start.line && i + 1 <= err.end.line)
        line = '>' + line;
      else
        line = ' ' + line;
      message += line;
    }
  }
  else {
    message = err.stack;
  }

  console.log(message);
};

/* istanbul ignore next */
module.exports = function(options) {
  // Normalize options
  var datafile = options.d || options.datafile;
  datafile = datafile ? datafile.replace(/sample-data\//, '') : null;

  options = {
    dir: process.cwd(),
    output: options.o || options.output || path.join(process.cwd(), 'output'),
    datafile: datafile,
    debug: options.debug,
    publish: options.p || options.publish
};

  card.create({
    mode: 'demo',
    language: 'javascript',
    dir: options.dir,
    libs: options.libs,
    params: {datafile: options.datafile}
  }, function(err, card) {
    if (err) {
      handleError(err);
      return;
    }

    if (options.publish) {
      var folder = 'card-demo/' + card.info.name.replace(/[^a-z\-]/g, '') +
        '/' + card.info.version + '/' + util.generateUUID() + '/';

      // Do the uploading
      async.series([
        // Upload harness
        function(callback) {
          async.each(Object.keys(card.harness), function(key, callback) {
            util.storage.put(folder, key, new Buffer(card.harness[key]), false, callback);
          }, callback);
        },
        // Upload static files
        function(callback) {
          Object.keys(card.static).forEach(function(type) {
            async.each(card.static[type], function(file, callback) {
              // path.join(options.dir, type, file);
              console.log('joining paths: ', options.dir, type, file);
              util.storage.put(folder, type + '/' + file, path.join(options.dir, type, file), true, callback);
            }, callback);
          });
        }
      ], function(err) {
        if (err) {
          console.error('Failed to upload card');
          process.exit(1);
        }
        var s3path = 'https://s3.amazonaws.com/yahoo-cards/' + folder + 'show.html';
        console.log('Uploaded to ' + s3path);
      });
    } else {
      var p = path.join(options.output, 'show.html');
      var d = path.dirname(p);

      mkdirp(d, function(err) {
        fs.writeFile(p, card.harness['show.html'], function(err) {
          if (err) {
            console.error((options.debug ? err.stack : null) || err.message || err);
            return process.exit(1);
          }
          console.log('Wrote show.html to', options.output);
        });
      });
    }
  });
};
module.exports.doc = 'Compiles a card and outputs result to a single demo.html file' +
  '\n\t' + usage;
