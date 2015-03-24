var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var path = require('path')
  , async = require('async')
  ;

var json = require('./util/require')('json');

// TODO - We're at the point where mocking the filesystem is probably
//        the best way to go...

describe("json", function() {

  it("should have a .load() method defined", function() {
    assert.isDefined(json.load);
  });


  describe(".load()", function() {

    it("should load proper card.json", function(done) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'good'), function(err, card) {
        assert.ifError(err);
        assert.isDefined(card);

        assert.equal(card.name, 'test-card');
        assert.equal(card.version, '1.0.0');

        done();
      });
    });

    it("should barf on invalid card.json path", function(done) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);

        done();
      });
    });

    it("should require version field in card.json", function(done) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad1'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /version/);

        done();
      });
    });

    it("should require name field in card.json", function(done) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad2'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /name/);

        done();
      });
    });

    it("should barf on malformed card.json", function(done) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad3'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /token/);

        done();
      });
    });

  });

  describe(".getDataUrls()", function() {
    var data, result;

    beforeEach(function() {
      data = null;
      result = null;
    });

    it("should parse dataUrls", function() {
      data = {};
      result = json.getDataUrls(data);
      assert.equal(result.length, 0);
    });

    it("should default to non-prod", function () {
      data = {data: {'foo': true}};
      result = json.getDataUrls(data);  //non-production is implied
      assert.equal(result.length, 1);
      assert.match(result[0], /cards-data\.rc\.staging\.manhattan/);
    });

    it("should toggle production when desired", function () {
      data = {data: {'foo': true}};
      result = json.getDataUrls(data, 'production');
      assert.equal(result.length, 1);
      assert.match(result[0], /fastly\.net/);
    });

    it("should handle multiple data sources", function() {
      data = {data: {'foo': true, 'bar': true}};
      result = json.getDataUrls(data);
      assert.equal(result.length, 2);
    });

    it("should use a given hostname if one is provided", function () {
      data = {data: {'foo': true}};
      result = json.getDataUrls(data, 'production', 'localhost:3000');
      assert.equal(result.length, 1);
      assert.match(result[0], /^https:\/\/localhost:3000/);
    });
  })
});
