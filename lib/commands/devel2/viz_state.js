var fs = require('fs')
  , path = require('path')
  , util = require('util')
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
  this.cardJSON = {};

  fs.watch(path.join(this.options.dir, 'card.json'), function() {
    this.updateCardJSON();
  }.bind(this));
};
util.inherits(VizState, events.EventEmitter);

VizState.prototype.updateCardJSON = function() {
  fs.readFile(path.join(this.options.dir, 'card.json'), {encoding: 'utf8'}, function(err, data) {
    if (err) {
      console.error('Warning: Unable to get latest card.json:');
      console.error(err.stack || err.message || err);
      return;
    }

    this.cardJSON = JSON.parse(data);
    this.emit('cardJSON', this.cardJSON);
  }.bind(this));
};

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
