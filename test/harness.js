var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var harness = require('./util/require')('harness');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');


describe("harness", function() {
  describe(".create()", function() {
    it("should create javascript harnesses", function(done) {
      harness.create('javascript', {name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        done();
      });
    });

    it("should create a demo harness", function(done) {
      harness.create('javascript', {mode: 'demo', name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        done();
      });
    });

    it("should create a CPP harness", function(done) {
      harness.create('cpp', {name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        done();
      });
    });

    it("should fail creating a CPP harness if development?", function(done) {
      harness.create('cpp', {name: 'foo', dir: dir, development: true}, function(err, result) {
        assert.isDefined(err);

        done();
      });
    });

    it("should fail if asked to create a bogus harness", function(done) {
      harness.create('bogus', {name: 'foo', dir: dir}, function(err, result) {
        assert.isDefined(err);

        done();
      });
    });
  });
});
