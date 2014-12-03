var minify = require('./util/require')('util/minify');

exports.testAll = function(test, assert) {
  var js = minify('function wat(zam) { var baba = 1; return baba + zam }');

  assert.equal(js.match(/zam/), null);
  assert.equal(js.match(/baba/), null);

  test.finish();
};
