var run = require('./util/require')('run');

exports.testHasCommands = function(test, assert) {
  assert.isDefined(run.commands.devel);

  test.finish();
};

exports.testHandlesArgs = function(test, assert) {
  run.commands.__testHandleArgs = function(options) {
    assert.isDefined(options);
    assert.equal(options.a, true);
    assert.equal(options.foo, 'bar');
    assert.equal(options._.length, 1);
    assert.equal(options._[0], 'baz');
  };

  run('__testHandleArgs', ['-a', '--foo=bar', 'baz']);

  delete run.commands.__testHandleArgs;
  test.finish();
};
