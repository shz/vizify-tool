var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , generateDataModel = require('../generators/datamodel')
  , util = require('../util')
  ;
require("sugar");

var usage = 'Usage: vz generate datamodel [--output|-o DIR]';

/* istanbul ignore next */
module.exports = function(options) {
  // Normalize options
  options = {
    output: options.output,
    what: options._[0]
  };

  var schema;
  try {
    schema = require(path.join(process.cwd(), "data-schema.json"));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  generateDataModel.run(schema, function(err, res) {
    console.log(res);
  });
};

module.exports.doc = 'Generates source code for datamodel based on data-schema.json' +
                     '\n\t' + usage;

module.exports.argParserOpts = {
  string: ['output'],
  default: {
    output: path.join(process.cwd(), 'src', 'datamodel')
  },
  alias: {
    output: 'o'
  }
};
