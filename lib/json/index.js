var fs = require('fs')
  , path = require('path')
  ;

exports.load = function(dir, callback) {
  fs.readFile(path.join(dir, 'card.json'), {encoding: 'utf8'}, function(err, json) {
    if (err) return callback(err);

    var data = null;
    try {
      data = JSON.parse(json);
    } catch (err) {
      return callback(err);
    }

    if (!data.version)
      return callback(new Error('card.json is missing version field'));
    if (!data.name)
      return callback(new Error('card.json. is missing name field'));

    return callback(undefined, data);
  });
};

// Production data host is a fastly-based URL.
// Staging/devel data host is a manhattan staging URL presently,
//    but we are considering moving to a for-staging fastly 
//    service in the future.
var prodHost = 'cards.yahoo.com.global.prod.fastly.net';
var devHost = 'cards-data.rc.staging.manhattan.gq1.yahoo.com';

exports.getDataUrls = function(card, mode) {
  var root = 'http://' +
             (mode == 'production' ? prodHost : devHost) +
             '/data/live/';
  var results = [];

  var sources = card.data || {};
  for (var i in sources) /* istanbul ignore else */ if (sources.hasOwnProperty(i)) {
    results.push(root + i);
  }

  return results;
};

