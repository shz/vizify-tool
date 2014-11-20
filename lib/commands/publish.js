require('sugar');
var async = require('async')
  , omnistor = require('omnistor')
  , json = require('../json')
  , harness = require('../harness')
  ;

// Attempt to grab YCA cert
var cert;
/* jshint ignore:start */
try {
  cert = new (require('yca').YCA)().get_cert('yahoo.mobstor.client.cards.prod');
} catch (err) {

}
/* jshint ignore:end */

/* istanbul ignore next */
module.exports = function(options) {
  // Normalize options
  options = {
    dir: options.dir || process.cwd()
  };

  // Load up our reqs
  async.parallel({
    json: json.load.bind(json, options.dir)
  }, function(err, card) {
    var cardOptions = {
      entryPoint: card.json.name.camelize(false) + '.main',
      dataSource: null,
      dir: options.dir,
      name: card.json.name,
      width: card.json.size.width,
      height: card.json.size.height
    };

    harness.create('javascript', cardOptions, function(err, files) {
      if (err) {
        console.error(err.stack || err.message || err.toString());
        process.exit(1);
      }

      // Base folder to upload to
      var folder = 'card/' + card.json.name.replace(/[^a-z\-]/g, '') +
                   '/' + card.json.version + '/';


      // Base store, either Mobstor or S3
      var storage = omnistor.createClient({
        // Mobstor config
        host: 'cards.zenfs.com',
        certificate: cert,
        proxy: {
          host: 'yca-proxy.corp.yahoo.com',
          port: 3128
        },

        // S3 fallback
        s3: {
          key: 'AKIAJOH2K7QZJPPEZ6CQ',
          secret: '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',
          bucket: 'yahoo-cards'
        }
      });

      console.log('Uploading card to /' + folder + '');
      async.each(Object.keys(files), function(key, callback) {
        var contentType = 'text/plain; charset=utf-8';
        if (key.match(/\.js$/))
          contentType = 'application/javascript; charset=utf-8';
        else if (key.match(/\.html$/))
          contentType = 'text/html; charset=utf-8';
        var headers = {
          'Content-Type': contentType
        };
        storage.putBuffer(new Buffer(files[key]), folder + key, headers, function(err, res) {
          if (err) {
            console.error('Failed to upload', key, err.message);
            return callback(err);
          } else {
            console.log('Uploaded', key);
            return callback();
          }
        });
      }, function(err) {
        if (err) {
          console.error('Failed to upload card');
          process.exit(1);
        }
        console.log('Success!');
      });
    });
  });
};
