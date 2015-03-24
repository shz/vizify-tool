var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var parseLibs = require('./util/require')('util/parse-libs');

describe("parse-libs", function() {
  it("should return a 1 element array with default lib path ending in 'tool/src', given null input", function() {
    var libs = parseLibs();
    assert.equal(libs.length, 1);
    assert.match(libs[0], /\/src$/);
  });

  it("should have a single path as the first element of the returned array, with default path second", function() {
    var libs = parseLibs('foo/bar');
    assert.equal(libs.length, 2);
    assert.match(libs[0], /foo\/bar$/);
  });

  it("should split paths on colons", function() {
    var libs = parseLibs('foo/bar:baz/bing');
    assert.equal(libs.length, 3);
    assert.match(libs[0], /foo\/bar$/);
    assert.match(libs[1], /baz\/bing$/);
  });
});
