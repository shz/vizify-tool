var fs = require('fs')
  , path = require('path')
  , mustache = require('mustache')
  ;

exports.render = function(name, data, callback) {
  fs.readFile(path.join(__dirname, '..', '..', 'templates', name), {encoding: 'utf8'}, function(err, body) {
    if (err) return callback(err);

    try {
      return callback(undefined, mustache.render(body, data));
    } catch (err) {
      return callback(err);
    }
  });
};
