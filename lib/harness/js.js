var fs = require('fs')
  , async = require('async')
  , path = require('path')
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
    'show.html': function(cb) {
      if (options.mode === 'development') {
        template.render(html, {opts: JSON.stringify(options)}, cb);
      } else {
        template.render(html, options, cb);
      }
    },
    'show.js': function(cb) {
      if (options.mode === 'development') {
        fs.readFile(path.join(__dirname, '..', '..', 'release', 'show.js'), cb);
      } else {
        template.render('harness.js', options, cb);
      }
    },
    'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
    'card.js': function(callback) {
      compile.compileCard(options, 'javascript', function(err, files) {
        return callback(err, files && files['main.js']);
      });
    }
  }, callback);
};
