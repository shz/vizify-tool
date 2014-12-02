var run = require('./util/require')('run');

exports.testHasCommands = function(test, assert) {
  assert.isDefined(run.commands.devel);

  var temp = console.error;
  var err = null;
  console.error = function() {
    err =  new Error(Array.prototype.join.call(arguments, ' '));
  };
  var temp2 = process.exit;
  process.exit = function() {
    throw (err || new Error('blah'));
  };
  assert.throws(function() {
    run('blargh');
  }, /unknown/i);
  console.error = temp;
  process.exit = temp2;

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
