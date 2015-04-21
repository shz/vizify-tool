var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var parseLibs = require('./util/require')('util/parse-libs');

describe('parse-libs', function() {
  it('should always have a vizify lib', function() {
    var libs;

    libs = parseLibs();
    assert.property(libs, 'vizify')
    assert.match(libs.vizify, /\/src$/);

    libs = parseLibs('');
    assert.property(libs, 'vizify')
    assert.match(libs.vizify, /\/src$/);

    libs = parseLibs('foo=bar');
    assert.property(libs, 'vizify')
    assert.match(libs.vizify, /\/src$/);

    libs = parseLibs('vizify=sham/wow');
    assert.propertyVal(libs, 'vizify', 'sham/wow');
  });

  it('should allow multiple libs', function() {
    var libs = parseLibs('a=/a/lib,b=/b/lib');

    assert.propertyVal(libs, 'a', '/a/lib');
    assert.propertyVal(libs, 'b', '/b/lib');
  });
});
