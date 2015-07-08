var fs = require('fs')
  , path = require('path')
  ;

module.exports = require('./run');
module.exports.doc = fs.readFileSync(path.join(__dirname, 'doc.txt'), {encoding: 'utf8'});

