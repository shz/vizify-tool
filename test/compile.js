var chai = require('chai')
  , expect = chai.expect
  ;
var compile = require('./util/require')('compile');

var dir = require('path').join(__dirname, 'util', 'misc', 'harness_test');
var langs = ['javascript'];

describe("compile", function() {

  describe(".compileCard()", function() {

    langs.forEach(function(lang) {
      it("should compile cards into " + lang, function(done) {
        compile.compileCard({dir: dir, name: 'foo-bar'}, lang, function(err, files) {
          expect(err).to.not.be.ok;
          expect(files).to.be.an('object');
          expect(Object.keys(files)).to.have.length.above(0);

          done();
        });
      });

      it("should barf compiling missing dir into" + lang, function(done) {
        compile.compileCard({dir: dir + '/foo', name: 'foo-bar'}, lang, function(err, files) {
          expect(err).to.be.an.instanceof(Error);
          expect(files).to.not.be.ok;

          done();
        });
      });
    });

  });
});
