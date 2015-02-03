'use strict';
var FluxibleApp = require('fluxible');

var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/app.jsx'))
});
app.registerStore(require('./stores/card-player-state-store'));


module.exports = function(opts) {
  var query = {};
  window.location.search.substr(1).split('&').map(function(s) {
    return s.split('=').map(decodeURIComponent);
  }).forEach(function(a) {
    query[a[0]] = a[1];
  });

  opts.initialTime = query.t ? parseFloat(query.t) : null;
  opts.initialTime = isNaN(opts.initialTime) ? null : opts.initialTime;

  var App = app.getAppComponent();
  var dataSource = opts.dataSource;

  var loadApp = function(data) {
    app.rehydrate({context: {}}, function(err, context) {
      if (err) {
        throw err;
      }
      window.context = context;
      React.render(<App {...opts} context={context.getComponentContext()} cardData={data} />, document.body);
    });
  }

  // Kick things off by fetching data
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        loadApp(xhr.responseText);
      } else {
        var error = document.createElement('pre');
        error.className = 'error';
        error.appendChild(document.createTextNode(xhr.responseText || 'Network Error'));
        document.body.appendChild(error);
      }
    }
  };

  if (dataSource) {
    console.log("Loading app with data from: ", dataSource);
    xhr.open('GET', dataSource);
    xhr.send();
  }
  else {
    console.log("Loading app with no data");
    loadApp("{}");
  }
};
