var App = require('./components/app');

setTimeout(function() {
  React.render(React.createElement(App), document.body);
}, 10);
