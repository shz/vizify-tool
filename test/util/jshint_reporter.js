
var fs = require('fs')
  ;

module.exports = {
  reporter: function(errors) {
    var output = {};
    output.generated = new Date().toISOString();
    output.count = {
      files: process.env.FILE_COUNT || 50,
      errors: errors.length
    };
    output.errors = {};

    for (var i=0; i<errors.length; i++)
      output.errors[errors[i].file] = errors[i].error;

    console.log(JSON.stringify(output, null, 2));
  }
};

