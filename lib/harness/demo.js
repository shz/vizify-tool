var fs = require('fs')
  , async = require('async')
  , vzjs = require('vizify-javascript')
  , template = require('../common/template')
  , compile = require('../compile')
  ;

exports.create = function(options, callback) {

  var html = 'demo_harness.html';
  var js = 'demo_harness.js';

  async.waterfall([
    // render js templates
    function(callback) {

      var tasks = {
        'show.js': template.render.bind(this, js, options),
        'vizify.js': fs.readFile.bind(fs, vzjs.BROWSER_JS_PATH, {encoding: 'utf8'}),
        'card.js': function(callback) {
          compile.compileCard(options, 'javascript', function(err, files) {
            return callback(err, files && files['main.js']);
          });
        }
      };
      if (options.dataSource) {
        tasks['data.json'] = fs.readFile.bind(fs, options.dataSource, {encoding: 'utf8'});
      }

      async.parallel(tasks, callback);
    },

    // render final demo.html template
    function(results, callback) {
      options.showJs = results['show.js'];
      options.vizifyJs = results['vizify.js'];
      options.cardJs = results['card.js'];
      options.vizifyData = results['data.json'] || "{}";

      template.render(html, options, function(err, output) {
        callback(err, {'show.html': output});
      });
    }
  ], callback);
};
