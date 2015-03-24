var mockfs = require('mock-fs')
  , chai = require('chai')
  , expect = chai.expect
  , assert = chai.assert
  ;
var card = require('./util/require')('card/index');

describe('card', function() {
  describe(".read()", function() {

    afterEach(function() {
      mockfs.restore();
    });

    it("should read card.json", function(done) {
      mockfs({
        '/test': {
          'card.json': JSON.stringify({
            version: '1.0.0',
            name: 'test'
          }),
          'src': {
            'main.vgl': ''
          }
        }
      });

      card.read('/test', function(err, card) {
        expect(err).to.not.be.ok;
        expect(card).to.be.an('object');
        expect(card.version).to.equal("1.0.0");
        done();
      });
    });

    it("should require proper data in card.json", function(done) {
      mockfs({
        '/test': {
          'card.json': '{}',
          'src': {
            'main.vgl': ''
          }
        }
      });

      card.read('/test', function(err, card) {
        expect(err).to.be.an.instanceof(Error);
        expect(card).to.not.be.ok;

        done();
      });
    });

    it("should fail if there is no source to compile", function(done) {
      mockfs({
        '/test': {
          'card.json': JSON.stringify({
            version: '1.0.0',
            name: 'test'
          }),
          'src': {}
        }
      });

      card.read('/test', function(err, card) {
        expect(err).to.be.an.instanceof(Error);
        expect(card).to.not.be.ok;
        done();
      });
    });
  });
});
