var path = require('path');


//
// Parse lib paths in the format "my-lib=foo/bar/mylib,vizify=/blah"
// into a map of the form {'my-lib': 'foo/bar/mylib', 'vizify': '/blah}
//
module.exports = function(libsString) {
  var libs = libsString ? libsString.split(',') : [];
  var map = {
    vizify: path.join(__dirname, '..', '..', 'src')
  };

  libs.forEach(function(l) {
    var parts = l.split('=');
    map[parts[0]] = parts[1];
  });

  return map;
};
