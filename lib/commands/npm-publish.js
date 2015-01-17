var fs = require('fs')
  , path = require('path')
  , async = require('async')
  ;

module.exports = function(options) {
  var dir = require('os').cwd();
  var info = null;

  async.waterfall([
    // Load card info
    function(callback) {
      // TODO
      callback();
    },

    // Compile card
    function(callback) {
      // TODO
      callback();
    }

    // Write .npmignore
    function(callback) {
      fs.writeFile(path.join(dir, '.npmignore'), 'card.json\nsrc/\n', callback);
    },

    // Write package.json
    function(callback) {
      fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
        name: 'name-todo',
        version: '1.0.0'
        // More?
      }, null, 2), callback);
    }
  ], function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });
};
module.exports.doc = 'publish to ynpm';
