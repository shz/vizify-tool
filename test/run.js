var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var run = require('./util/require')('run');

describe("run", function () {
  it("has commands", function () {
    assert.isDefined(run.commands.init);
    assert.isDefined(run.commands.publish);
    assert.isDefined(run.commands.devel);
  });

  it("should throw if given an invalid command", function () {
    var consoleError = console.error;
    var err = null;
    console.error = function() {
      if (!err)
        err = new Error(Array.prototype.join.call(arguments, ' '));
    };

    var processExit = process.exit;
    process.exit = function() {
      throw (err || new Error('blah'));
    };

    assert.throws(function() {
      run('blargh');
    }, /usage/i);

    console.error = consoleError;
    process.exit = processExit;
  });

  describe("arg parsing", function () {
    it("should parse flags", function () {
      run.commands.__testHandleArgs = function(options) {
        assert.isDefined(options);
        assert.equal(options.a, true);
        assert.equal(options.foo, 'bar');
        assert.equal(options._.length, 1);
        assert.equal(options._[0], 'baz');
      };

      run('__testHandleArgs', ['-a', '--foo=bar', 'baz']);

      delete run.commands.__testHandleArgs;
    });
  });
});
