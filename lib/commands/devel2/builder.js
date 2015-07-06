var virgil = require('virgil')
  , VizState = require('./viz_state')
  ;

exports.bootstrap = function(options) {
  var vs = new VizState(options);
  var watch = function() {
    virgil.support.watch(vs.world, function() {
      vs.compile();
    });
  };

  vs.on('error', watch);
  vs.on('compile', watch);

  return vs;
};
