var async = require('async');
var harness = require('./util/require')('harness');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');

exports.testJavascript = function(test, assert) {
  async.parallel([
    function(callback) {
      harness.create('javascript', {name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        callback();
      });
    },
    function(callback) {
      harness.create('javascript', {name: 'foo', dir: dir, development: true}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        callback();
      });
    }
  ], function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports.testDemo = function(test, assert) {

  harness.create('javascript', {mode: 'demo', name: 'foo', dir: dir}, function(err, result) {
    assert.ifError(err);
    assert.notEqual(Object.keys(result).length, 0);
    test.finish();
  });
};

exports.testCpp = function(test, assert) {
  async.parallel([
    function(callback) {
      harness.create('cpp', {name: 'foo', dir: dir}, function(err, result) {
        assert.ifError(err);
        assert.notEqual(Object.keys(result).length, 0);

        callback();
      });
    },
    function(callback) {
      harness.create('cpp', {name: 'foo', dir: dir, development: true}, function(err, result) {
        assert.isDefined(err);

        callback();
      });
    }
  ], function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports.testBogus = function(test, assert) {
  harness.create('bogus', {name: 'foo', dir: dir}, function(err, result) {
    assert.isDefined(err);

    test.finish();
  });
};
