var async = require('async');
var compile = require('./util/require')('compile');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');
var langs = [];

var eachLang = function(f, cb) {
  async.forEach(['javascript', 'cpp'], f, cb);
};

exports.testValid = function(test, assert) {
  eachLang(function(language, callback) {
    compile.compileCard({dir: dir, name: 'foo-bar'}, language, function(err, body) {
      assert.ifError(err);
      assert.isDefined(body);

      callback();
    });
  }, function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports.testMissing = function(test, assert) {
  eachLang(function(language, callback) {
    compile.compileCard({dir: dir + '/foo', name: 'foo-bar'}, language, function(err, body) {
      assert.isDefined(err);

      callback();
    });
  }, function(err) {
    assert.ifError(err);

    test.finish();
  });
};

exports.testBroken = function(test, assert) {
  // TODO - Test bad VGL

  test.finish();
};
