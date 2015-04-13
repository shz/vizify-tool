var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var harness = require('./util/require')('harness');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');


describe("harness", function() {
  describe(".create()", function() {
    it("should create javascript harnesses", function(done) {
      harness.create('javascript', {entryPoint: 'foo.main', name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        done();
      });
    });

    it("should create a demo harness", function(done) {
      harness.create('javascript', {entryPoint: 'foo.main', mode: 'demo', name: 'foo', dir: dir}, function(err, result) {
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

    describe("production harness", function() {
      it("should fit inside one MTU", function(done) {
        harness.create('javascript', {entryPoint: 'foo.main', name: 'foo', dir: dir}, function(err, result) {
          try {
            assert.ifError(err);
            assert.isDefined(result);
            assert.property(result, 'show.html');
            assert.isBelow(result['show.html'].length * 0.7, 1400); // Assume 30% gzip compression

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("should fit inside one MTU when replayable", function(done) {
        var opts = {entryPoint: 'foo.main', name: 'foo', dir: dir, replayable: true};
        harness.create('javascript', opts, function(err, result) {
          try {
            assert.ifError(err);
            assert.isDefined(result);
            assert.property(result, 'show.html');
            assert.isBelow(result['show.html'].length * 0.7, 1400); // Assume 30% gzip compression

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
});
