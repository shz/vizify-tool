require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , omnistor = require('omnistor')
  , util = require('../util')
  , card = require('../card')
  , conio = require('../util/conio').stdio
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
    dir: options.dir || process.cwd(),
    force: options.force || options.f || false
  };

  card.create({
    mode: 'production',
    language: 'javascript',
    dir: options.dir
  }, function(err, card) {
    if (err) {
      console.error(err.stack || err.message || err.toString());
      process.exit(1);
    }

    // Base folder to upload to
    var folder = 'card/' + card.info.name.replace(/[^a-z\-]/g, '') +
                 '/' + card.info.version + '/';


    // Base store, either Mobstor or S3 depending on the environment
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

    // Check function
    var checkExisting = function(filename, callback) {
      console.log('Checking for an existing version of the card at', folder + filename);
      storage.headFile(folder + filename, function(err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res.statusCode === 200);
      });
    };

    // Util put function
    var put = function(filename, data, isFile, callback) {
      var headers = {'Content-Type': util.mime.generate(filename)};

      var finish = function(err, res) {
        if (err) {
          console.error('Failed to upload', filename, err.message);
          console.error(err.stack);
          return callback(err);
        } else {
          console.log('Uploaded', filename);
          return callback();
        }
      };

      (isFile ? storage.putFile : storage.putBuffer).call(storage,
        data, folder + filename, headers, finish);
    };

    var publishCard = function() {
      // Minify JS
      Object.keys(card.harness).forEach(function(key) {
        if (key.match(/\.js$/))
          card.harness[key] = util.minify(card.harness[key]);
      });

      // Do the uploading
      async.series([
        // Upload harness
        function(callback) {
          async.each(Object.keys(card.harness), function(key, callback) {
            put(key, new Buffer(card.harness[key]), false, callback);
          }, callback);
        },
        // Upload static files
        function(callback) {
          Object.keys(card.static).forEach(function(type) {
            async.each(card.static[type], function(file, callback) {
              put(type + '/' + file, path.join(options.dir, type, file), true, callback);
            }, callback);
          });
        }
      ], function(err) {
        if (err) {
          console.error('Failed to upload card');
          process.exit(1);
        }
        console.log('Success!');
        process.exit(0);
      });
    };

    checkExisting('card.js', function(err, cardExists) {
      if (err) {
        console.error('Failed to check for existing card at', folder + '/card.js');
        process.exit(1);
      }

      if (!cardExists) {
        publishCard();
        return;
      }

      if (options.force) {
        console.log('`--force` flag specified; force publishing.')
        publishCard();
        return;
      }

      if (process.stdin.isTTY) {
        conio.prompt('A version of this card has already been published; type \'yes\' to overwrite.', 'no', function(err, response) {
          if (response.toLowerCase() === 'yes') {
            publishCard();
          } else {
            console.log('Not uploading card.');
            process.exit(0);
          }
        });
      }
    });

  });
};
module.exports.doc = 'Publish the card in the current directory';
