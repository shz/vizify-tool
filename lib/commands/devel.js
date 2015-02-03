require('sugar');
var qs = require('querystring')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , card = require('../card')
  , util = require('../util')
  ;

var handleStaticRequest = function(dir, req, res) {
  var filename = req.url.split('?')[0];
  var fullpath = path.join(dir, filename);
  fs.readFile(fullpath, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end('Not found');
    } else {
      res.writeHead(200, {'Content-Type': util.mime.generate(filename)});
      res.end(data);
    }
  });
};

function formatCompilationError(err) {
  var message = 'Error in ' + err.filename + ': ' + err.message + '\n\n';
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

  return message;
}

/* istanbul ignore next */ // TODO - Let's actually test this!
module.exports = function(options) {
  // Normalize options
  options = {
    dir: options.dir || process.cwd(),
    port: parseInt(options.port || 3000, 10),
    libs: options.libs
  };

  // Our file cache.  This gets created the first request, and
  // expires after 200ms.
  var cache = null;

  // Start up our dev server
  var server = http.createServer(function(req, res) {
    if (req.url.match(/^\/img\//) || req.url.match(/^\/sample-data\//))
      return handleStaticRequest(options.dir, req, res);

    var serve = function() {
      if (req.url == '/production' || req.url.split('?')[0] == '/')
        req.url = '/show.html';

      var file = req.url.substr(1);
      if (file.match(/^dev\//)) {
        handleStaticRequest(path.join(__dirname, '..', '..', 'static'), req, res);
      } else if (cache.hasOwnProperty(file)) {
        res.writeHead(200, {'Content-Type': util.mime.generate(file)});
        res.end(cache[file]);
      } else {
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Not found');
      }
    };

    if (cache) {
      serve();
    } else {
      card.create({
        mode: (req.url == '/production') ? 'production' : 'development',
        language: 'javascript',
        dir: options.dir,
        libs: options.libs,
        params: qs.parse(req.url.split('?')[1] || '')
      }, function(err, card) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
          var message = '';

          if (err.src && err.filename && err.start && err.end) {
            message = formatCompilationError(err);
          } else {
            message = err.stack;
          }

          res.end(message);
          return;
        }

        console.log('Regenerated files');

        cache = card.harness;
        setTimeout(function() {
          cache = null
        }, 200);
        serve();
      });
    }
  });

  server.listen(options.port, function () {
    console.log('Vizify Cards Development Server');
    console.log('  Working dir', options.dir);
    console.log('  Listening on port', options.port);
    console.log('  Lib path: ', options.libs);
    console.log('');
  });
};

module.exports.doc = 'Run a development server for the card in the current directory' +
  '\n\t[--dir ROOT_DIR] Directory containing card.json. Defaults to .' +
  '\n\t[--port PORT] Port to run on. Defaults to 3000' +
  '\n\t[--libs LIB_PATH] colon separated list of directories to search for virgil libs';
