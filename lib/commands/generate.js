var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , generateDataModel = require('../generators/datamodel')
  , util = require('../util')
  ;
require("sugar");

var usage = 'Usage: vz generate datamodel [--debug|-d] [--output|-o DIR]';

/* istanbul ignore next */
module.exports = function(options) {
  // Normalize options
  options = {
    output: options.output,
    what: options._[0]
  };

  if(options.what === "datamodel") {
    var schema;
    try {
      schema = require(path.join(process.cwd(), "data-schema.json"));
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    generateDataModel.run(schema, function(err, res) {
      if(err) {
        console.error((options.debug ? err.stack : null) || err.message || err);
        process.exit(1);
      }

      var filepath = path.join(options.output, "datamodel.vgl");
      mkdirp(options.output, function(err) {
        if(err) {
          console.error((options.debug ? err.stack : null) || err.message || err);
          process.exit(1);
        }

        fs.writeFile(filepath, res, function(err) {
          if (err) {
            console.error((options.debug ? err.stack : null) || err.message || err);
            return process.exit(1);
          }
          console.log('Wrote datamodel.vgl to', options.output);
        });
      });
    });
  }

};

module.exports.doc = 'Generates source code for datamodel based on data-schema.json' +
                     '\n\t' + usage;

module.exports.argParserOpts = {
  string: ['output'],
  boolean: ['debug'],
  default: {
    output: path.join(process.cwd(), 'src')
  },
  alias: {
    output: 'o',
    debug: 'd'
  }
};
