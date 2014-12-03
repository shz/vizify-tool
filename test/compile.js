var compile = require('./util/require')('compile');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');

exports.testValid = function(test, assert) {
  compile.compileCard({dir: dir, name: 'foo-bar'}, 'javascript', function(err, body) {
    assert.ifError(err);
    assert.isDefined(body);

    test.finish();
  });
};

exports.testMissing = function(test, assert) {
  compile.compileCard({dir: dir + '/foo', name: 'foo-bar'}, 'javascript', function(err, body) {
    assert.isDefined(err);

    test.finish();
  });
};

exports.testBroken = function(test, assert) {
  // TODO - Test bad VGL

  test.finish();
};
