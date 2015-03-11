require('sugar');
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , util = require('../util')
  , card = require('../card')
  , conio = require('../util/conio').stdio
  , storage = require('../util/storage')
  , buildPruneOpts = require('../util/build-prune-opts')
  ;

/* istanbul ignore next */
module.exports = function(options) {

  card.create({
    mode: 'production',
    language: 'javascript',
    dir: options.dir,
    prune: buildPruneOpts(options.prune)
  }, function(err, card) {
    if (err) {
      console.error(err.stack || err.message || err.toString());
      process.exit(1);
    }

    // Base folder to upload to
    var folder = 'card/' + card.info.name.replace(/[^a-z\-]/g, '') +
      '/' + card.info.version + '/';

    console.log('Uploading card to /' + folder + '');

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
            storage.put(folder, key, new Buffer(card.harness[key]), false, callback);
          }, callback);
        },
        // Upload static files
        function(callback) {
          Object.keys(card.static).forEach(function(type) {
            async.each(card.static[type], function(file, callback) {
              storage.put(folder, type + '/' + file, path.join(options.dir, type, file), true, callback);
            }, callback);
          });
        }
      ], function(err) {
        if (err) {
          console.error('Failed to upload card. ', err.message);
          console.error(err.stack);
          process.exit(1);
        }
        console.log('Success!');
        process.exit(0);
      });
    };

    console.log('Checking for an existing version of the card at', folder);
    storage.checkExisting(folder, 'card.js', function(err, cardExists) {
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

module.exports.doc = 'Publish the card in the current directory.\n' + [
  '[--dir ROOT_DIR] Root directory containing card.json. Defaults to .',
  '[-f|--force] Overwrite already-published card',
  '[-p|--prune ENTRYPOINT] Prune - prune code unreachable from ENTRYPOINT while compiling'
].map(function(s) {return '\t' + s;}).join('\n');

module.exports.argParserOpts = {
  string: ['dir'],
  boolean: ['force'],
  default: {
    dir: process.cwd(),
    force: false
  },
  alias: {
    force: 'f',
    prune: 'p'
  }
};
