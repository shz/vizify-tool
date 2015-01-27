require('sugar');
var fs = require('fs')
  , qs = require('querystring')
  , path = require('path')
  , async = require('async')
  , json = require('../json')
  , harness = require('../harness')
  ;

var checkSourceDir = function(dir, callback) {
  async.series([
    // Make sure src folder exists
    function(callback) {
      fs.stat(path.join(dir, 'src'), function(err, stat) {
        if (err) return callback(new Error('Missing src/ directory'));
        if (!stat.isDirectory()) return callback(new Error('src/ is not a directory'));

        callback();
      });
    },

    // Make sure src/main.vgl exists
    function(callback) {
      fs.stat(path.join(dir, 'src', 'main.vgl'), function(err, stat) {
        if (err) return callback(new Error('Missing src/main.vgl'));
        if (!stat.isFile()) return callback(new Error('src/main.vgl is not a file'));

        callback();
      });
    }

    // TODO - Check that src/main.vgl has a main function exported
  ], callback);
};

exports.read = function(dir, callback) {
  async.parallel({
    json: json.load.bind(json, dir),
    source: checkSourceDir.bind(this, dir)
  }, function(err, results) {
    if (err) return callback(err);

    return callback(undefined, results.json);
  });
};

/* istanbul ignore next */
exports.create = function(options, callback) {
  // Normalize options
  options = {
    dir: options.dir,
    language: options.language,
    mode: options.mode || 'development',
    params: options.params || {}
  }

  // Useful stuff
  var info = null;
  var dataSource = null;
  var testDataFiles = null;

  async.waterfall([
    // Read the basics
    exports.read.bind(this, options.dir),

    // Set up dataSource.
    function(card, callback) {
      dataSource = json.getDataUrls(card, options.mode)[0];

      // for production mode we're done. Otherwise carry on with dataSource refinement
      if (options.mode != 'development') {
        return callback(undefined, card);
      }

      // Set up datasource.  In production we get nothing, in development
      // we get the default for the datasource, and then merge in request
      // params to built the final result.
      if (options.params['datafile'] && options.params['datafile'] != 'none') {
        dataSource = path.join('sample-data', options.params['datafile']);
      } else {
        if (dataSource) {
          var dataParams = card.data[Object.keys(card.data)[0]].defaults;
          for (var i in options.params) if (options.params.hasOwnProperty(i)) {
            if (!i.match(/^data_/))
              continue;

            dataParams[i.replace(/^data_/, '')] = options.params[i];
          }
          dataSource += '?' + qs.stringify(dataParams);
        }
      }

      // grab sample data files if any
      fs.readdir(path.join(options.dir, 'sample-data'), function(err, files) {
        if (err) {
          if (options.params['datafile']) {
            console.log('Error reading sample-data directory. Does it exist?');
          }
          // ignore the error because it's non-fatal
          return callback(undefined, card);
        }
        testDataFiles = files.map(function(f) {
          return {name: f, selected: f === options.params['datafile']};
        });
        return callback(undefined, card);
      });
    },

    // Create the harness
    function(card, callback) {
      // Save this for later
      info = card;

      // Harness options
      var createOptions = {
        entryPoint: card.name.camelize(false) + '.main',
        dataSource: dataSource,
        dir: options.dir,
        name: card.name,
        width: card.size.width,
        height: card.size.height,
        replayable: !!card.replayable,
        development: options.mode == 'development',
        testDataFiles: testDataFiles
      };

      harness.create(options.language, createOptions, callback);
    },

    // Merge in static file list
    function(harness, callback) {
      var ret = {
        info: info,
        harness: harness,
        static: {
          img: []
        }
      };

      async.each(Object.keys(ret.static), function(key, callback) {
        fs.readdir(path.join(options.dir, key), function(err, files) {
          if (err) return callback(err);
          ret.static[key] = files;
          callback();
        });
      }, function(err) {
        if (err && err.code === 'ENOENT') {
          console.warn('Warning (ignored): missing directory: ' + err.path);
        } else if (err) {
          return callback(err);
        }
        return callback(undefined, ret);
      });
    }

    // And done

  ], callback);
};
