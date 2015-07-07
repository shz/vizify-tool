var path = require('path')
  , virgil = require('virgil')
  ;

var websocketHandler = function(app, ws) {
  // Client state
  var watching = false;

  ws.on('message', function(data, flags) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.error('Bad message from client:', data);
      return;
    }

    switch (data.type) {
      case 'watch':
        watching = true;
        break;
      case 'unwatch':
        watching = false;
        break;
      case 'compile':
        app.locals.state.compile();
        break;
      default:
        console.error('Unknown client message:', data.type);
        break;
    }
  });

  var onError = function(err) {
    if (watching) {
      var ctx = virgil.support.errors.getErrorContext(err);

      ws.send(JSON.stringify({
        type: 'error',
        message: err.message,
        // loc: err.loc,
        filename: err.filename,
        // src: err.src
        highlighted: ctx.highlight(virgil.support.errors.highlighters.html),
        gutter: ctx.gutter()
      }));
    }
  };
  var onCompile = function(output, world) {
    if (watching) {
      ws.send(JSON.stringify({
        type: 'compile',
        code: output['main.js']
      }));
    }
  };
  var onClose = function() {
    console.log('Closing');

    app.locals.state.removeListener('error', onError);
    app.locals.state.removeListener('compile', onCompile);
  };

  app.locals.state.on('error', onError);
  app.locals.state.on('compile', onCompile);
  ws.once('close', onClose);
};

exports.bind = function(options, app, wss) {
  wss.on('connection', websocketHandler.bind(undefined, app));

  app.get('/', function(req, res) {
    res.status(200).type('text/html; charset=utf-8').sendFile(path.join(__dirname, 'static', 'index.html'));
  });
};
