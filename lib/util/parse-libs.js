var path = require('path');


// Parse a colon separated list of lib directories and return as an array
// Default lib path is always appended to the returned array
// e.g. 'foo/bar:/bing/baz' ==> ['foo/bar', '/bing/baz', '../../src']
//       null ==> ['../../src']
module.exports = function(libsString) {
  var libs = libsString ? libsString.split(':') : [];
  libs.push(path.join(__dirname, '..', '..', 'src'));
  return libs;
};
