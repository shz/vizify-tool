/* istanbul ignore next */
var readLine = function(callback) {
  var chunks = [];

  var done = function() {
    done = null;

    var line = Buffer.concat(chunks).toString('utf8');
    process.stdin.removeListener('data', handler);
    callback(undefined, line);
  };

  var handler = function(c) {
    for (var i = 0; i < c.length; i++) {
      if (c[i] == 0x0A) { // \n
        chunks.push(c.slice(0, i));
        if (done)
          done();
        break;
      }
    }
    chunks.push(c);
  };
  process.stdin.on('data', handler);
};

/* istanbul ignore next */
var prompt = function(thing, def, callback) {
  if (typeof def == 'function') {
    callback = def;
    def = undefined;
  }

  process.stdout.write(thing + (def === undefined ? '' : ' (' + def + ')') + ': ');
  readLine(function(err, line) {
    if (!line.trim()) {
      line = def || '';
    }

    if (typeof def == 'number')
      line = parseFloat(line);
    callback(undefined, line);
  });
};


module.exports = prompt;
