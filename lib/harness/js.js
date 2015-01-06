var fs = require('fs')
  , async = require('async')
  , esmangle = require('esmangle')
  , vzjs = require('vizify-javascript')
  , template = require('../common/template')
  , compile = require('../compile')
  ;

exports.create = function(options, callback) {
  // Validate options
  // TODO

  var html = options.development ? 'dev_harness.html' : 'harness.html';
  var js = options.development ? 'dev_harness.js' : 'harness.js';

  async.parallel({
    'show.html': template.render.bind(this, html, options),
    'show.js': template.render.bind(this, js, options),
    'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
    'card.js': compile.compileCard.bind(compile, options, 'javascript')
  }, callback);
};
