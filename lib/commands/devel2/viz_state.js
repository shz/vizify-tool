var util = require('util')
  , events = require('events')
  , compile = require('../../compile').compileCard
  ;

var VizState = module.exports = function VizState(options) {
  events.EventEmitter.call(this);
  this.options = {
    libs: options.libs,
    dir: options.dir,
    browserify: true,
    prune: true,
    name: 'viz'
  };
};
util.inherits(VizState, events.EventEmitter);

VizState.prototype.compile = function() {
  var self = this;

  compile(this.options, 'javascript', function(err, output, world) {
    self.js = output;
    self.world = world;

    if (err) {
      self.emit('error', err, world);
    } else {
      self.emit('compile', output, world);
    }
  });
};
