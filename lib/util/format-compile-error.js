var virgil = require('virgil');

module.exports = function(err) {
  virgil.support.errors.printErrorContext(err);
};
