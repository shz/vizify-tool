var path = require('path')
  , async = require('async')
  ;

var json = require('./util/require')('json');

// TODO - We're at the point where mocking the filesystem is probably
//        the best way to go...

exports.testLoad = function(test, assert) {
  assert.isDefined(json.load);
  async.parallel([
    // Missing JSON
    function(callback) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);

        callback();
      });
    },

    // Bad JSON 1
    function(callback) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad1'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /version/);

        callback();
      });
    },

    // Bad JSON 2
    function(callback) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad2'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /name/);

        callback();
      });
    },

    // Bad JSON 3
    function(callback) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'bad3'), function(err, card) {
        assert.isDefined(err);
        assert.isUndefined(card);
        assert.match(err.message, /token/);

        callback();
      });
    },

    // Good JSON
    function(callback) {
      json.load(path.join(__dirname, 'util', 'misc', 'card_json', 'good'), function(err, card) {
        assert.ifError(err);
        assert.isDefined(card);

        assert.equal(card.name, 'test-card');
        assert.equal(card.version, '1.0.0');

        callback();
      });
    }

  ], test.finish.bind(test));
};

exports.testGetDataUrls = function(test, assert) {
  var data = null;
  var result = null;

  data = {};
  result = json.getDataUrls(data);
  assert.equal(result.length, 0);

  data = {data: {'foo': true}};
  result = json.getDataUrls(data);  //non-production is implied
  assert.equal(result.length, 1);
  assert.match(result[0], /cards-data\.rc\.staging\.manhattan/);

  result = json.getDataUrls(data, 'production');
  assert.equal(result.length, 1);
  assert.match(result[0], /fastly\.net/);

  data = {data: {'foo': true, 'bar': true}};
  result = json.getDataUrls(data);
  assert.equal(result.length, 2);

  test.finish();
};
