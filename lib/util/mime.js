var mime = require('mime');

exports.generate = function(filename) {
  var mimeType = mime.lookup(filename);
  if (mime.charsets.lookup(mimeType))
    mimeType += '; charset=' + mime.charsets.lookup(mimeType).toLowerCase();
  else if (mimeType == 'application/javascript')
    mimeType += '; charset=utf-8';
  return mimeType;
};
