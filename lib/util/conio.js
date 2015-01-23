function ConsoleIO(instream, outstream) {
  this._instream = instream;
  this._outstream = outstream;
}
ConsoleIO.prototype.readLine = function(callback) {
  var chunks = [];
  var self = this;

  var done = function() {
    done = null;

    var line = Buffer.concat(chunks).toString('utf8');
    self._instream.removeListener('data', handler);
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
  this._instream.on('data', handler);
};

ConsoleIO.prototype.prompt = function(thing, def, callback) {
  if (typeof def == 'function') {
    callback = def;
    def = undefined;
  }

  this._outstream.write(thing + (def === undefined ? '' : ' (' + def + ')') + ': ');
  this.readLine(function(err, line) {
    if (!line.trim()) {
      line = def || '';
    }

    if (typeof def == 'number')
      line = parseFloat(line);
    callback(undefined, line);
  });
};

ConsoleIO.stdio = new ConsoleIO(process.stdin, process.stdout);

module.exports = ConsoleIO;