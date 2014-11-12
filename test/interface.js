var lib = require('./util/require')('index');

exports.testHarness = function(test, assert) {
  assert.isDefined(lib.harness);
  assert.isDefined(lib.harness.create);

  test.finish();
};
