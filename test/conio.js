var streamBuffers = require('stream-buffers');
var async = require('async');
var ConsoleIO = require('./util/require')('util/conio');

var istream, ostream, io;

exports.testReadLine = function(test, assert) {

  async.series([
    // Basic success case
    function(callback) {
      istream.put("abcdef\n", 'utf8');
      io.readLine(function(err, read) {
        assert.equal(read, "abcdef");
        callback();
      });
    },

    // Currently does not buffer the rest of the stream for the next call to readLine
    function(callback) {
      istream.put("abcdef\nthisShouldGetDiscarded", 'utf8');
      io.readLine(function(err, read) {
        assert.equal(read, "abcdef");
        io.readLine(function(err, read) {
          assert.equal(read, "123456");
          callback();
        });
        istream.put("123456\n", 'utf8');
      });
    }
  ], test.finish.bind(test));

};

exports.testPrompt = function(test, assert) {
  async.series([
    // Basic success case
    function(callback) {
      istream.put("asdf\n");
      io.prompt("hello", "olleh", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (olleh): ");
        assert.equal(input, "asdf");
        callback();
      });
    },

    // No default provided
    function(callback) {
      istream.put("asdf\n");
      io.prompt("hello", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello: ");
        assert.equal(input, "asdf");
        callback();
      });
    },

    // Numeric default
    function(callback) {
      istream.put("888\n");
      io.prompt("hello", 25, function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (25): ");
        assert.equal(input, 888);
        callback();
      });
    },

    // Numeric input with string default
    function(callback) {
      istream.put("888\n");
      io.prompt("hello", "25", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (25): ");
        assert.equal(input, "888");
        callback();
      });
    }

  ], test.finish.bind(test));
};

exports.setUp = function(test) {
  istream = new streamBuffers.ReadableStreamBuffer();
  ostream = new streamBuffers.WritableStreamBuffer();
  io = new ConsoleIO(istream, ostream);
  test.finish();
};

exports.tearDown = function(test) {
  istream.destroy();
  ostream.destroy();
  test.finish();
};