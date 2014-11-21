require('sugar');
var qs = require('querystring')
  , http = require('http')
  , mime = require('mime')
  , async = require('async')
  , json = require('../json')
  , harness = require('../harness')
  ;

var checkSourceDir = function(options, callback) {
  // TODO
  callback();
};

/* istanbul ignore next */ // TODO - Let's actually test this!
module.exports = function(options) {
  // Normalize options
  options = {
    dir: options.dir || process.cwd(),
    port: parseInt(options.port || 3000, 10)
  };

  // Sanity check
  // TODO - Move to per-request?
  async.parallel({
    json: json.load.bind(json, options.dir),
    source: checkSourceDir.bind(this, options)
  }, function(err, card) {
    // Error messages will be handled by the appropriate
    // check function.
    if (err) {
      console.log(err.message);
      return;
    }

    // Our file cache.  This gets created the first request, and
    // expires after 100ms.
    var cache = null;

    // Start up our dev server
    var server = http.createServer(function(req, res) {
      var reqOptions = qs.parse(req.url.split('?')[1] || '');

      // Base card options
      var cardOptions = {
        width: 300,
        height: 300,
        entryPoint: card.json.name.camelize(false) + '.main',
        dataSource: json.getDataUrls(card.json, 'development')[0],
        dir: options.dir,
        name: card.json.name
      };

      // TODO - Apply reqOptions

      // Merge in data options
      var dataParams = card.json.data[Object.keys(card.json.data)[0]].defaults;
      cardOptions.dataSource += '?' + qs.stringify(dataParams);

      var serve = function() {
        if (req.url.split('?')[0] == '/')
          req.url = '/show.html';

        var file = req.url.substr(1);
        if (cache.hasOwnProperty(file)) {
          var mimeType = mime.lookup(file);
          if (mime.charsets.lookup(mimeType))
            mimeType += '; charset=' + mime.charsets.lookup(mimeType).toLowerCase();
          res.writeHead(200, {'Content-Type': mimeType});
          res.end(cache[file]);
        } else {
          res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
          res.end('Not found');
        }
      };

      if (cache) {
        serve();
      } else {
        harness.create('javascript', cardOptions, function(err, files) {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            var message = '';

            if (err.src && err.filename && err.start && err.end) {
              message = 'Error in ' + err.filename + ': ' + err.message + '\n\n';
              var lines = err.src.split(/\r?\n/);
              var start = Math.max(0, err.start.line - 5);
              var end = Math.min(lines.length, err.end.line + 5) - 1;
              var gutterSize = (end + 1).toString().length + 2;

              for (var i=start; i<end; i++) {
                var line = (i+1).toString().pad(gutterSize) + '| ' + lines[i] + '\n';
                if (i+1 >= err.start.line && i+1 <= err.end.line)
                  line = '>' + line;
                else
                  line = ' ' + line;
                message += line;
              }
            } else {
              message = err.stack;
            }

            res.end(message);
            return;
          }

          console.log('Regenerated files');

          cache = files;
          setTimeout(function() {
            cache = null
          }, 100);
          serve();
        });
      }
    });


    server.listen(options.port);
    console.log('Vizify Cards Development Server');
    console.log('  Working dir', options.dir);
    console.log('  Listening on port', options.port);
    console.log('');
  })
};
