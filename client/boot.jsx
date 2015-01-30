var App = require('./components/app.jsx');
var CardPlayerStateStore = require('./stores/card-player-state-store');

module.exports = function(opts) {
  var query = {};
  window.location.search.substr(1).split('&').map(function(s) {
    return s.split('=').map(decodeURIComponent);
  }).forEach(function(a) {
    query[a[0]] = a[1];
  });

  opts.initialTime = parseFloat(query.t);

  var dataSource = opts.dataSource;
  // Kick things off by fetching data
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        React.render(<App {...opts} cardData={xhr.responseText}/>, document.body);
      } else {
        var error = document.createElement('pre');
        error.className = 'error';
        error.appendChild(document.createTextNode(xhr.responseText || 'Network Error'));
        document.body.appendChild(error);
      }
    }
  };
  console.log("getting data from:", dataSource);
  xhr.open('GET', dataSource);
  xhr.send();

};
