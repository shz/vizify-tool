var fs = require('fs')
  , async = require('async')
  , path = require('path')
  , vzjs = require('vizify-javascript')
  , template = require('../common/template')
  , compile = require('../compile')
  , util = require('../util')
  ;

var dev = function(options, callback) {
  async.parallel({
    'show.html': template.render.bind(template, 'dev_harness.html', {opts: JSON.stringify(options)}),
    'show.js': fs.readFile.bind(fs, path.join(__dirname, '..', '..', 'release', 'show.js')),
    'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
    'card.js': function(callback) {
      compile.compileCard(options, 'javascript', function(err, files) {
        return callback(err, files && files['main.js']);
      });
    }
  }, callback);
};

var prod = function(options, callback) {
  template.render('harness.js', options, function(err, harness) {
    try {
      harness = util.minify(harness);
    } catch (e) {
      return callback(e);
    }

    var showOptions = {
      harnessJS: harness,
      replayable: options.replayable
    };

    async.parallel({
      'show.html': template.render.bind(template, 'harness.html', showOptions),
      'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
      'card.js': function(callback) {
        compile.compileCard(options, 'javascript', function(err, files) {
          return callback(err, files && files['main.js']);
        });
      }
    }, callback);
  });
};

exports.create = function(options, callback) {
  // TODO: Validate options
  if (!options.entryPoint) {
    return callback(new Error('Missing options.entryPoint'));
  }

  return (options.mode == 'development' ? dev : prod)(options, callback);
};
