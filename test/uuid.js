var generateUUID = require('./util/require')('util/uuid');

exports.testAll = function(test, assert) {
  var uuid = generateUUID();
  assert.match(uuid, /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
  test.finish();
};
