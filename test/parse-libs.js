var parseLibs = require('./util/require')('util/parse-libs');

exports.testAll = function(test, assert) {

  // null input should result in a 1 element array with default lib path ending in 'tool/src'
  var libs = parseLibs();
  assert.equal(libs.length, 1);
  assert.match(libs[0], /tool\/src$/);

  // a single path should be first element of returned array w/ default path the second
  libs = parseLibs('foo/bar');
  assert.equal(libs.length, 2);
  assert.match(libs[0], /foo\/bar$/);

  // handle foo/bar:baz/bing case
  libs = parseLibs('foo/bar:baz/bing');
  assert.equal(libs.length, 3);
  assert.match(libs[0], /foo\/bar$/);
  assert.match(libs[1], /baz\/bing$/);

  test.finish();
};
