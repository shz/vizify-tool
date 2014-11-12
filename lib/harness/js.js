var async = require('async')
  , esmangle = require('esmangle')
  , vizifyJavascript = require('vizify-javascript')
  , template = require('../common/template')
  ;

exports.create = function(options, callback) {
  // TODO - Static images, fonts

  async.parallel({
    'show.html': template.render.bind(this, 'harness.html', options),
    'show.js': template.render.bind(this, 'harness.js', options)
  }, callback);
};
