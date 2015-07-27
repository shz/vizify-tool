var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , events = require('events')
  , virgil = require('virgil')
  , compile = require('../../compile').compileCard
  , VizData = require('../../viz_data')
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

  this.vizData = new VizData(options.dir);
  this.err = null;
  this.js = null;
  this.world = null;

  // Watch card.json for changes
  fs.watch(path.join(this.options.dir, 'card.json'), function() {
    this.updateVizData();
  }.bind(this));

  // Watch source for changes
  var watch = function() {
    virgil.support.watch(this.world, function() {
      this._compile();
    }.bind(this));
  }.bind(this);
  this.on('error', watch);
  this.on('compile', watch);
  this._compile();
};
util.inherits(VizState, events.EventEmitter);

VizState.prototype.updateVizData = function() {
  this.vizData.read(function() {
    this.emit('vizData', this.vizData);
  }.bind(this));
};

VizState.prototype._compile = function() {
  var self = this;
  console.log('Compiling');

  compile(this.options, 'javascript', function(err, output, world) {
    self.js = output;
    self.world = world;
    self.err = err;

    if (err) {
      self.emit('error', err, world);
    } else {
      self.emit('compile', output, world);
    }
  });
};

