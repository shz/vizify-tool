var harness = require('./util/require')('harness');

exports.testJavascript = function(test, assert) {
  harness.create('javascript', {}, function(err, result) {
    assert.ifError(err);
    assert.notEqual(Object.keys(result).length, 0);

    test.finish();
  });
};

exports.testCpp = function(test, assert) {
  harness.create('cpp', {}, function(err, result) {
    assert.ifError(err);

    assert.notEqual(Object.keys(result).length, 0);

    test.finish();
  });
};

exports.testBogus = function(test, assert) {
  harness.create('bogus', {}, function(err, result) {
    assert.isDefined(err);

    test.finish();
  });
};
