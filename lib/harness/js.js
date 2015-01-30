var fs = require('fs')
  , async = require('async')
  , path = require('path')
  , browserify = require('browserify')
  , reactify = require('reactify')
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
      if (options.development) {
        template.render(html, {opts: JSON.stringify(options)}, cb);
      } else {
        template.render(html, options, cb);
      }
    },
    'show.js': function(cb) {
      if (options.development) {
        var b = browserify({standalone: 'boot'});
        b.transform(reactify, {extension: 'jsx'});
        b.add(path.join(__dirname, '..', '..', 'client', 'boot.jsx'));
        //TODO bundle vizify and card.js
        b.bundle(function(err, buf) {
          if (err) {
            console.log(err.stack);
          }
          cb(err, buf);
        });
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
