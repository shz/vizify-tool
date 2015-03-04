module.exports = function(err) {
  var message = 'Error in ' + err.filename + ': ' + err.message + '\n\n';
  var lines = err.src.split(/\r?\n/);
  var start = Math.max(0, err.loc.start.line - 5);
  var end = Math.min(lines.length, err.loc.end.line + 5) - 1;
  var gutterSize = (end + 1).toString().length + 2;

  var pad = function(str, num) {
    var len = str.length;
    while(num-- > len) {
      str = str + ' ';
    }
    return str;
  };

  for (var i = start; i < end; i++) {
    var line = pad((i + 1).toString(), gutterSize) + '| ' + lines[i] + '\n';
    if (i + 1 >= err.loc.start.line && i + 1 <= err.loc.end.line)
      line = '>' + line;
    else
      line = ' ' + line;
    message += line;
  }
  return message;
};
