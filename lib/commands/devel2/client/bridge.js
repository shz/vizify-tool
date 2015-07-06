var events = require('events')
  , util = require('util')
  ;

var Bridge = module.exports = function Bridge() {
  events.EventEmitter.call(this);

  this.pending = [];

  this._open();
};
util.inherits(Bridge, events.EventEmitter);

Bridge.prototype.send = function(type, opts) {
  if (!this.ws) {
    this.pending.push(Array.prototype.slice.call(arguments));
    return;
  }

  var msg = { type: type };
  if (opts) {
    for (var i in opts) if (opts.hasOwnProperty(i)) {
      msg[i] = opts[i];
    }
  }

  this.ws.send(JSON.stringify(msg));
};

Bridge.prototype.close = function() {
  try {
    this.ws.close();
  } catch (err) {}

  delete this.ws;
};

Bridge.prototype._open = function() {
  if (this._openTimeout !== undefined) {
    return;
  }
  this._openTimeout = setTimeout(function() {
    delete this._openTimeout;

    this.ws = new WebSocket(window.location.href.replace(/^http/, 'ws'));
    this.ws.addEventListener('close', this._onError.bind(this));
    this.ws.addEventListener('error', this._onError.bind(this));
    this.ws.addEventListener('message', this._onMessage.bind(this));
    this.ws.addEventListener('open', function() {
      while (this.pending.length) {
        this.send.apply(this, this.pending.shift());
      }
    }.bind(this));
  }.bind(this), 100);
};

Bridge.prototype._onError = function() {
  this.close();
  this._open();
};

Bridge.prototype._onMessage = function(msg) {
  var data = JSON.parse(msg.data);
  var type = data.type;
  delete data.type;

  this.emit(type, data);
};
