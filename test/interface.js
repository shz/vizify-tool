var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var lib = require('./util/require')('index');

describe("lib", function () {

  it("should include a harness object", function () {
    assert.isDefined(lib.harness);
    assert.isDefined(lib.harness.create);
  });

});
