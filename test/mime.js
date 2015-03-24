var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var mime = require('./util/require')('util/mime');

var jsMime = 'application/javascript; charset=utf-8';
var pngMime = 'image/png';
var htmlMime = 'text/html; charset=utf-8';

describe("mime.generate()", function() {
  it("should generate proper mime type strings", function () {
    assert.equal(mime.generate('foo.js'), jsMime);
    assert.equal(mime.generate('foo.png'), pngMime);
    assert.equal(mime.generate('foo.html'), htmlMime);
    assert.equal(mime.generate('this/is/a/path.html'), htmlMime);
  });
});
