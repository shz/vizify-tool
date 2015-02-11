require('sugar');
var qs = require('querystring')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , card = require('../card')
  , util = require('../util')
  , formatCompileError = require('../util/format-compile-error')
  ;

var handleStaticRequest = function(dir, req, res) {
  var filename = req.url.split('?')[0];
  var fullpath = path.join(dir, filename);

  // check if file is a directory
  fs.stat(fullpath, function(err, stats) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
      var error = 'Error: ' + err.stack || err.toString();
      console.log(error);
      res.end(error);
      return;
    }
    if (stats.isDirectory()) {
      fs.readdir(fullpath, function(err, files) {
        var data = files.map(function(f) {
          return {name: f};
        });
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
      });
    } else {
      fs.readFile(fullpath, function(err, data) {
        if (err) {
          res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
          res.end('Not found');
        } else {
          res.writeHead(200, {'Content-Type': util.mime.generate(filename)});
          res.end(data);
        }
      });
    }
  });
};

var handlePost = function(dir, req, res) {
  var filename = req.url.split('?')[0];
  var fullpath = path.join(dir, filename);

  console.log("POST: " + req.url);
  var writable = fs.createWriteStream(fullpath);
  req.pipe(writable);
  req.on('end', function() {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'success'}));
  });
};

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
    if (req.method === "POST") {
      return handlePost(options.dir, req, res);
    }
    if (req.url.match(/^\/src\/vizify\//)) {
      // serve vizify-virgil files relative to tool package root dir
      return handleStaticRequest(path.join(__dirname, '..', '..'), req, res);
    }
    if (req.url.match(/^\/img\//) ||
        req.url.match(/^\/src\/*/) ||
        req.url.match(/^\/sample-data\//)) {
      return handleStaticRequest(options.dir, req, res);
    }

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
            message = formatCompileError(err);
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
    console.log('  Lib path: ', options.libs || 'default');
    console.log('');
  });
};

module.exports.doc = 'Run a development server for the card in the current directory' +
  '\n\t[--dir ROOT_DIR] Directory containing card.json. Defaults to .' +
  '\n\t[--port PORT] Port to run on. Defaults to 3000' +
  '\n\t[--libs LIB_PATH] colon separated list of directories to search for virgil libs';
