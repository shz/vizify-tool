var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var path = require('path')
  , template = require('./util/require')('common/template')
  ;

describe("template", function() {

  describe(".render()", function() {
    it("should render existing templates", function(done) {
      template.render('harness.html', {}, function(err, result) {
        assert.ifError(err);
        assert.isDefined(result);
        assert.notEqual(result.length, 0);

        done();
      });
    });

    it("should error if missing template", function(done) {
      template.render('some_bogus_file.ugh', {}, function(err, result) {
        assert.isDefined(err);

        done();
      });
    });

    it("should error if given a bad template", function(done) {
      var p = path.join('..', 'test', 'util', 'misc', 'bad_template.html');
      template.render(p, {}, function(err, result) {
        assert.isDefined(err);

        done();
      });
    });
  });
});
