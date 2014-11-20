require('sugar');
var qs = require('querystring')
  , http = require('http')
  , async = require('async')
  , virgil = require('virgil')
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
        if (req.url.split('?')[0] == '/') {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          res.end(cache['show.html']);

        } else if (req.url.match(/\.js$/)) {
          res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
          res.end(cache[req.url.substr(1)]);

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
            res.end(err.stack || err.message || err.toString());
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
