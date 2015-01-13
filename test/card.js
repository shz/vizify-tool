var mockfs = require('mock-fs')
  , async = require('async')
  ;
var card = require('./util/require')('card/index');

exports.testRead = function(test, assert) {
  var testCorrect = function(callback) {
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
      mockfs.restore();

      try {
        assert.ifError(err);
        assert.isDefined(card);
      } catch (e) {
        err = e;
      }

      callback(err);
    });
  };
  var testIncorrect1 = function(callback) {
    mockfs({
      '/test': {
        'card.json': '{}',
        'src': {
          'main.vgl': ''
        }
      }
    });

    card.read('/test', function(err, card) {
      mockfs.restore();

      try {
        assert.isDefined(err);
        assert.isUndefined(card);
        err = undefined;
      } catch (e) {
        err = e;
      }

      callback(err);
    });
  };
  var testIncorrect2 = function(callback) {
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
      mockfs.restore();

      try {
        assert.isDefined(err);
        assert.isUndefined(card);
        err = undefined;
      } catch (e) {
        err = e;
      }

      callback(err);
    });
  };

  async.series([
    testCorrect,
    testIncorrect1,
    testIncorrect2
  ], function(err) {
    assert.ifError(err);
    test.finish();
  });

};
