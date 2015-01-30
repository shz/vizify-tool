var fs = require('fs')
  , async = require('async')
  , vzjs = require('vizify-javascript')
  , template = require('../common/template')
  , compile = require('../compile')
  ;

exports.create = function(options, callback) {
  // TODO: Validate options
  var prefix = options.mode == 'development' ? 'dev_' : '';
  var html = prefix + 'harness.html';
  var js = prefix + 'harness.js';

  async.parallel({
    'show.html': template.render.bind(this, html, options),
    'show.js': template.render.bind(this, js, options),
    'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
    'card.js': function(callback) {
      compile.compileCard(options, 'javascript', function(err, files) {
        return callback(err, files && files['main.js']);
      });
    }
  }, callback);
};
