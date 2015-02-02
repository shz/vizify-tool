var omnistor = require('omnistor')
  , mime = require('./mime');

// Attempt to grab YCA cert
var cert;
/* jshint ignore:start */
try {
  cert = new (require('yca').YCA)().get_cert('yahoo.mobstor.client.cards.prod');
} catch (err) {

}
/* jshint ignore:end */

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

// Check for the existence of
exports.checkExisting = function(folder, filename, callback) {
  console.log('Checking for an existing version of the card at', folder + filename);
  storage.headFile(folder + filename, function(err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res.statusCode === 200);
  });
};

// Write data to storage

// todo: add auto-expire for 30 days: header: [x-ysws-autoexpires: 2592000] seconds

exports.put = function(folder, filename, data, isFile, callback) {;
  var headers = {'Content-Type': mime.generate(filename)};

  console.log('folder ', folder);
  
  // add auto-expiration header for demo cards on mobstor.
  // our s3 bucket is configured to auto-delete demo cards after 30 days also.
  if (folder.indexOf('card-demo' == 0)) {
    headers['x-ysws-autoexpires'] = 2592000; // 30 days
  }

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
