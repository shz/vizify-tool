var path = require('path')
  , template = require('./util/require')('common/template')
  ;

exports.testRenderExisting = function(test, assert) {
  template.render('harness.html', {}, function(err, result) {
    assert.ifError(err);
    assert.isDefined(result);
    assert.notEqual(result.length, 0);

    test.finish();
  });
};

exports.testRenderMissing = function(test, assert) {
  template.render('some_bogus_file.ugh', {}, function(err, result) {
    assert.isDefined(err);

    test.finish();
  });
};

exports.testBadTemplate = function(test, assert) {
  var p = path.join('..', 'test', 'util', 'misc', 'bad_template.html');
  template.render(p, {}, function(err, result) {
    assert.isDefined(err);

    test.finish();
  });
};
