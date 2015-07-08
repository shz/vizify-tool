var fs = require('fs')
  , path = require('path')
  , virgil = require('virgil')
  ;

var websocketHandler = function(app, ws) {
  // Client state
  var watching = false;

  ws.on('message', function(data, flags) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.error('Bad message from client:', err.message, '\n', data);
      return;
    }

    switch (data.type) {
      case 'watch':
        watching = true;
        break;
      case 'unwatch':
        watching = false;
        break;
      case 'requestDataFile':
        fs.readFile(path.join(app.locals.state.options.dir, 'sample-data', data.name), {encoding: 'utf8'}, function(err, body) {
          if (err) {
            console.warn(err.stack || err.message);
          }
          if (body) {
            ws.send(JSON.stringify({
              type: 'dataFile',
              data: body
            }));
          }
        });
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
    console.log('Client disconnected');
    app.locals.state.removeListener('error', onError);
    app.locals.state.removeListener('compile', onCompile);
    app.locals.state.removeListener('cardJSON', onUpdateCardJSON);
  };
  var onUpdateCardJSON = function(data) {
    if (watching) {
      ws.send(JSON.stringify({
        type: 'cardJSON',
        data: data
      }));
    }
  };

  app.locals.state.on('error', onError);
  app.locals.state.on('compile', onCompile);
  app.locals.state.on('cardJSON', onUpdateCardJSON);
  ws.once('close', onClose);

  // Bootstrap!
  console.log('Client connected');
  ws.emit('message', JSON.stringify({type: 'watch'}));
  app.locals.state.updateCardJSON();
  if (app.locals.state.err) {
    onError(app.locals.state.err);
  } else {
    onCompile(app.locals.state.js, app.locals.state.world);
  }
};

exports.bind = function(options, app, wss) {
  wss.on('connection', websocketHandler.bind(undefined, app));

  app.get('/', function(req, res) {
    res.status(200).type('text/html; charset=utf-8').sendFile(path.join(__dirname, 'static', 'index.html'));
  });
};
