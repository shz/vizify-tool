var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var streamBuffers = require('stream-buffers');
var ConsoleIO = require('./util/require')('util/conio');


describe("conio", function() {
  var istream, ostream, io;

  beforeEach(function() {
    istream = new streamBuffers.ReadableStreamBuffer();
    ostream = new streamBuffers.WritableStreamBuffer();
    io = new ConsoleIO(istream, ostream);
  });

  afterEach(function() {
    istream.destroy();
    ostream.destroy();
  });


  describe(".readLine()", function() {

    it("should read from inputstream", function(done) {
      istream.put("abcdef\n", 'utf8');
      io.readLine(function(err, read) {
        expect(read).to.equal("abcdef");
        done();
      });
    });

    it("currently does not buffer the rest of the stream for the next call to readLine", function(done) {
      istream.put("abcdef\nthisShouldGetDiscarded", 'utf8');
      io.readLine(function(err, read) {
        expect(read).to.equal("abcdef");

        io.readLine(function(err, read) {
          expect(read).to.equal("123456");
          done();
        });

        istream.put("123456\n", 'utf8');
      });
    });

  });

  describe(".prompt", function() {
    it("should print a prompt and read from input", function (done) {
      istream.put("asdf\n");
      io.prompt("hello", "olleh", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (olleh): ");
        assert.equal(input, "asdf");
        done();
      });
    });

    it("should work without a default provided", function(done) {
      istream.put("asdf\n");
      io.prompt("hello", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello: ");
        assert.equal(input, "asdf");
        done();
      });
    });

    it("should call back with a numeric value of a numeric default is provided", function(done) {
      istream.put("888\n");
      io.prompt("hello", 25, function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (25): ");
        assert.equal(input, 888);
        done();
      });
    });

    it("should not call back with a numeric value if a string default is provided", function(done) {
      istream.put("888\n");
      io.prompt("hello", "25", function (err, input) {
        assert.equal(ostream.getContentsAsString('utf8'), "hello (25): ");
        assert.equal(input, "888");
        done();
      });
    });
  });

});
