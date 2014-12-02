var mime = require('./util/require')('util/mime');

var jsMime = 'application/javascript; charset=utf-8';
var pngMime = 'image/png';
var htmlMime = 'text/html; charset=utf-8';

exports.testAll = function(test, assert) {
  assert.equal(mime.generate('foo.js'), jsMime);
  assert.equal(mime.generate('foo.png'), pngMime);
  assert.equal(mime.generate('foo.html'), htmlMime);
  assert.equal(mime.generate('this/is/a/path.html'), htmlMime);

  test.finish();
};
