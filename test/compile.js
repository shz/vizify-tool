var async = require('async');
var compile = require('./util/require')('compile');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');
var langs = [];

var eachLang = function(f, cb) {
  async.forEach(['javascript'], f, cb);
};

exports.testValid = function(test, assert) {
  eachLang(function(language, callback) {
    compile.compileCard({dir: dir, name: 'foo-bar'}, language, function(err, files) {
      try {
        assert.ifError(err);
        assert.isDefined(files);
        assert.type(files, 'object');
        assert.equal(true, Object.keys(files).length >= 1);
      } catch (e) {
        err = e;
      }

      callback(err);
    });
  }, function(err) {
    if (err)
      console.log(err.stack);
    assert.ifError(err);
    test.finish(err);
  });
};

exports.testMissing = function(test, assert) {
  eachLang(function(language, callback) {
    compile.compileCard({dir: dir + '/foo', name: 'foo-bar'}, language, callback);
  }, function(err) {
    assert.isDefined(err);

    test.finish();
  });
};

exports.testBroken = function(test, assert) {
  // TODO - Test bad VGL

  test.finish();
};
