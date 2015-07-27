require('sugar');
var websocket = require('ws')
  , http = require('http')
  , path = require('path')
  , express = require('express')
  , routes = require('./routes')
  , normalizeOptions = require('./normalize_options')
  , VizState = require('./viz_state')
  ;

/* istanbul ignore next */
module.exports = function(options) {
  options = normalizeOptions(options);

  var app = express();
  var server = http.createServer(app);
  var ws = new websocket.Server({server: server});

  app.use('/static', express.static(path.join(__dirname, 'static')));
  routes.bind(options, app, ws);

  app.locals.state = new VizState(options);

  server.listen(options.port, function() {
    console.log('Vizify Cards Development Server');
    console.log('  Working dir', options.dir);
    console.log('  Listening on port', options.port);
    console.log('  Lib path: ', options.libs || 'default');
    console.log('');
  });
};
