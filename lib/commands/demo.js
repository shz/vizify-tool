var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , card = require('../card')
  , compile = require('../compile')
  , util = require('../util')
  ;

var usage = 'Usage: vz demo [--libs LIB_PATH] [-o|--ouput OUTPUT_DIR]';

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

module.exports = function(options) {
  // Normalize options
  options = {
    output: options.o || options.output || path.join(process.cwd(), 'output'),
    language: 'javascript',
    dir: process.cwd(),
    libs: util.parseLibs(options.libs),
    debug: options.debug
  }

  card.create({
    mode: 'demo',
    language: 'javascript',
    dir: options.dir,
    libs: options.libs
  }, function(err, card) {
    if (err) {
      handleError(err);
      return;
    }

    // console.log("demo generated : " + Object.keys(card.harness).join(', '));

    // now dump all the files to a single output file.
    var p = path.join(options.output, 'demo.html');
    var d = path.dirname(p);

    mkdirp(d, function(err) {
      fs.writeFile(p, card.harness, function(err) {
        if (err) {
          console.error((options.debug ? err.stack : null) || err.message || err);
          return process.exit(1);
        }
        console.log('Wrote demo.html to', options.output);
      });
    });
  });
};
module.exports.doc = 'Compiles a card and outputs result to a single demo.html file' +
  '\n\t' + usage;
