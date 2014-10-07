
// Require that respects our janked-up NODE_PATH style
// of imports if we need it.
//
// Use like require('../util/require')('index_node')

module.exports = function(mod) {
  var base = (process.env.NODE_PATH || 'lib').split(':')[0];

  return require('../../../' + base + '/' + mod);
};

