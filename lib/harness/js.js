var fs = require('fs')
  , async = require('async')
  , esmangle = require('esmangle')
  , vzjs = require('vizify-javascript')
  , template = require('../common/template')
  ;

exports.create = function(options, callback) {
  // TODO - Static images, fonts

  async.parallel({
    'show.html': template.render.bind(this, 'harness.html', options),
    'show.js': template.render.bind(this, 'harness.js', options),
    'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'})
  }, callback);
};
