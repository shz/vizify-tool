var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var minify = require('./util/require')('util/minify');


describe("minify", function () {
  it("should minify", function () {
    var js = minify('function wat(zam) { var baba = 1; return baba + zam }');

    assert.equal(js.match(/zam/), null);
    assert.equal(js.match(/baba/), null);
  });
});
