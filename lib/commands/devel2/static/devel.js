(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"events":31,"util":36}],2:[function(require,module,exports){
var vizify = require('vizify-javascript')
  , Bridge = require('../bridge')
  , Viz = require('./viz')
  , CompileError = require('./compile_error')
  ;

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      viz: null,
      error: null,
      data: '{"status": "active"}'
    }
  },

  render: function() {
    var viz = null;
    if (this.state.viz) {
      viz = React.createElement(Viz, {viz: this.state.viz});
    } else {
      viz = React.createElement("h1", null, "Loading");
    }

    var error = null;
    if (this.state.error) {
      error = React.createElement(CompileError, {details: this.state.error});
    }

    return (
      React.createElement("div", {className: "app-component"}, 
        viz, 
        error
      )
    );
  },

  componentDidMount: function() {
    this.bridge = new Bridge();
    this.bridge.on('compile', this.onCompile);
    this.bridge.on('error', this.onCompileError);
    this.bridge.send('watch');
    this.bridge.send('compile');
  },
  componentWillUnmount: function() {
    this.bridge.close();
    this.bridge = null;
  },

  componentDidUpdate: function() {
    if (this.state.viz) {
      this.reload();
    }
  },

  onGetData: function(data) {
    this.setState({ data: data });
  },
  onCompile: function(data) {
    (function() { eval(data.code) }).call(window);

    if (!this.state.viz) {
      var viz = new vizify.Viz(window.viz.main, 500, 60, 1, this.state.data);
      viz.load(function() {
        this.setState({ viz: viz, error: null });
      }.bind(this));
    } else {
      this.setState({ error: null });
      this.reload();
    }
  },
  onCompileError: function(data) {
    this.setState({ error: data });
  },

  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});

},{"../bridge":1,"./compile_error":3,"./viz":6,"vizify-javascript":21}],3:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    details: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      React.createElement("div", {className: "compile-error-component"}, 
        React.createElement("div", {className: "filename"}, "Error in ", this.props.details.filename, ":"), 
        React.createElement("div", {className: "gutter"}, 
          this.props.details.gutter.map(function(s) {
            return React.createElement("pre", null, s);
          })
        ), 
        React.createElement("div", {className: "context"}, 
          this.props.details.highlighted.map(function(s) {
            return React.createElement("pre", {dangerouslySetInnerHTML: {__html: s}})
          })
        ), 
        React.createElement("div", {className: "message"}, this.props.details.message)
      )
    );
  }
});

},{}],4:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return { playing: false };
  },

  render: function() {
    return (
      React.createElement("div", {className: "playpause-component", onClick: this.onToggle}, 
        this.state.playing ? '❙❙' : '►'
      )
    );
  },

  componentDidMount: function() {
    this.props.viz.on('end', this.onEnd);
    this.props.viz.on('play', this.onPlay);
    this.props.viz.on('pause', this.onPause);
  },
  componentWillUnmount: function() {
    this.props.viz.removeEventListener('end', this.onEnd);
    this.props.viz.removeEventListener('play', this.onPlay);
    this.props.viz.removeEventListener('pause', this.onPause);
  },

  onToggle: function() {
    if (this.state.playing) {
      this.props.viz.pause();
    } else {
      if (this.props.viz.duration === this.props.viz.getTime()) {
        this.props.viz.seek(0);
      }
      this.props.viz.play();
    }
  },
  onEnd: function() {
    this.setState({ playing: false });
  },
  onPlay: function() {
    this.setState({ playing: true });
  },
  onPause: function() {
    this.setState({ playing: false });
  }
});

},{}],5:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      ts: 0,
      duration: 0
    };
  },

  render: function() {
    var scale = 'scale(' + (this.state.ts / this.state.duration) + ', 1)';
    var innerStyle = {
      transform: scale,
      OTransform: scale,
      msTransform: scale,
      Moztransform: scale,
      WebkitTransform: scale
    };

    return (
      React.createElement("div", {className: "scrubber-component", ref: "scrubber"}, 
        React.createElement("div", {className: "text"}, this.state.ts.toFixed(0), " / ", this.state.duration), 
        React.createElement("div", {className: "inner", style: innerStyle})
      )
    );
  },

  componentDidMount: function() {
    this.props.viz.on('frame', this.onFrame);
    this.touchKiller = vz.touch(this.refs.scrubber.getDOMNode(), {
      click: this.onSeek,
      drag: this.onSeek
    });
  },
  componentWillUnmount: function() {
    this.props.viz.removeListener('frame', this.onFrame);
    this.touchKiller();
    delete this.touchKiller();
  },

  onFrame: function(ts) {
    this.setState({ ts: ts, duration: this.props.viz.card.duration });
  },
  onSeek: function(e) {
    if (e.dragState !== 1) {
      this.calculateBounds();
    }

    // Turn our window position into a value in [0, 1] based on position
    // within the scrubber bounds.
    var p = Math.min(1, Math.max(0, (e.absolute.x - this.bounds.left)) / this.bounds.width);

    var ts = this.state.duration * p;
    this.props.viz.pause();
    this.props.viz.frame(ts);
    this.props.viz.seek(ts);
    if (e.dragState === undefined) {
      this.props.viz.play();
    }
  },

  calculateBounds: function() {
    this.bounds = this.refs.scrubber.getDOMNode().getClientRects()[0];
  }
});

},{}],6:[function(require,module,exports){
var PlayPause = require('./playpause')
  , Scrubber = require('./scrubber')
  ;

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      React.createElement("div", {className: "viz-component"}, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {ref: "holder"}), 
          React.createElement(PlayPause, {viz: this.props.viz}), 
          React.createElement(Scrubber, {viz: this.props.viz})
        )
      )
    );
  },

  componentDidMount: function() {
    this.mountElement();
  },
  componentDidUpdate: function() {
    this.mountElement();
  },

  mountElement: function() {
    var node = this.refs.holder.getDOMNode();
    Array.prototype.forEach.call(node.childNodes, function(el) {
      node.removeChild(el);
    });
    node.appendChild(this.props.viz.element);
  }
});

},{"./playpause":4,"./scrubber":5}],7:[function(require,module,exports){
var App = require('./components/app');

setTimeout(function() {
  React.render(React.createElement(App), document.body);
}, 10);

},{"./components/app":2}],8:[function(require,module,exports){
/* global DOMException */

var invert = require('./invert-matrix');

//
// A 2x3 matrix of the form:
//
// [a, c, e]
// [b, d, f]
//
// API is similar to that of SVGMatrix
//
var AffineMatrix = module.exports = function AffineMatrix(a, b, c, d, e, f) {
  // Matrix-like things
  if (a && typeof a === 'object' && typeof a.a === 'number') {
    f = a.f;
    e = a.e;
    d = a.d;
    c = a.c;
    b = a.b;
    a = a.a;

  // Array-like things
  } else if (a && a.length) {
    f = a[5];
    e = a[4];
    d = a[3];
    c = a[2];
    b = a[1];
    a = a[0];
  }

  // Use an identity matrix by default, overridden by whatever the user
  // provides.
  this.a = a === undefined ? 1 : a;
  this.b = b === undefined ? 0 : b;
  this.c = c === undefined ? 0 : c;
  this.d = d === undefined ? 1 : d;
  this.e = e === undefined ? 0 : e;
  this.f = f === undefined ? 0 : f;
};
AffineMatrix.prototype = {
  constructor: AffineMatrix,

  multiply: function(m) {
    return new AffineMatrix(
      this.a * m.a + this.c * m.b,
      this.b * m.a + this.d * m.b,
      this.a * m.c + this.c * m.d,
      this.b * m.c + this.d * m.d,
      this.a * m.e + this.c * m.f + this.e,
      this.b * m.e + this.d * m.f + this.f
    );
  },
  multiplyVector: function(x, y) {
    var error = function() {
      throw new Error("Don't know how to multiply a " + x.toString());
    };

    if (typeof x === 'object') {
      if (x.length === 2) {
        y = x[1];
        x = x[0];
      } else if (typeof x.x === 'number' && typeof x.y === 'number') {
        y = x.y;
        x = x.x;
      } else {
        error();
      }
    } else if (typeof x !== 'number' || typeof y !== 'number') {
      error();
    }

    return {
      x: this.a * x + this.c * y + this.e,
      y: this.b * x + this.d * y + this.f
    };
  },

  rotate: function(rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);

    return this.multiply(new AffineMatrix(
      c, s, -s, c, 0, 0
    ));
  },
  scale: function(x, y) {
    return this.multiply(new AffineMatrix(
      x, 0, 0, y, 0, 0
    ));
  },
  translate: function(x, y) {
    return this.multiply(new AffineMatrix(
      1, 0, 0, 1, x, y
    ));
  },

  toString: function() {
    return '[ ' + [this.a, this.c, this.e].join(', ') + '\n' +
                  [this.b, this.d, this.f].join(', ') + ' ]';
  },
  toArray: function() {
    return [ this.a, this.b, this.c, this.d, this.e, this.f ];
  },

  inverse: function () {
    var ctm = this;
    var inverseMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    inverseMatrix = invert(inverseMatrix, [ctm.a, ctm.b, 0, ctm.c, ctm.d, 0, ctm.e, ctm.f, 1]);
    if(!inverseMatrix) {
      var exception = new DOMException("Matrix not invertible");
      exception.code = 2; // value of const SVG_MATRIX_NOT_INVERTABLE
      throw exception;
    }

    // Column-major to SVGMatrix style
    return new AffineMatrix([
      inverseMatrix[0],
      inverseMatrix[1],
      inverseMatrix[3],
      inverseMatrix[4],
      inverseMatrix[6],
      inverseMatrix[7]
    ]);
  }
};

},{"./invert-matrix":22}],9:[function(require,module,exports){
var util = require('util');
var events = require('events');
var GradientSpec = require('./gradient_spec');
var invertCoordinates = require('./utils').invertCoordinates;
var AffineMatrix = require('./affine_matrix');

var Canvas = module.exports = function Canvas(width, height, scaling) {
  events.EventEmitter.call(this);

  if (typeof document === 'undefined') {
    throw new Error('Don\'t know how to create a canvas element');
  }

  // Prep internal state
  this.canvas = document.createElement('canvas');
  this._ctx = this.canvas.getContext('2d');
  this.width = 0;
  this.height = 0;
  this.scaling = 0;
  this.textCache = [];
  this._ratio = 0;
  this._saveCount = 0;
  this._ext = {};

  // Bootstrap canvas size
  this.resize(width, height, scaling);

  // Determine basic sans-serif font family based on user agent
  this.fontFamilySansSerif = (navigator.userAgent.match(/Mac/)) ? 'Helvetica Neue' : 'Arial';

  // Rendering optimizations
  this._ctx.patternQuality = 'best';
  this._ctx.textDrawingMode = 'path';
  this._ctx.antialias = 'subpixel';
  this._ctx.webkitImageSmoothingEnabled = true;

  // Listen for events
  this.regions = [];
};
util.inherits(Canvas, events.EventEmitter);


// Internal utility
/* istanbul ignore next */
Canvas.prototype.regionEventListener = function(eventType, ev) {
  if (this.regions && this.regions.length > 0) {
    var canvasCoords = this.computeDocumentPosition().toCanvasCoords(ev.absolute.x, ev.absolute.y);
    var inverseCoords;
    var region;
    for (var i = 0; i < this.regions.length; i += 1) {
      region = this.regions[i];
      inverseCoords = invertCoordinates(canvasCoords, region.transform);
      // TODO consider overlapping regions in the future.
      // Currently latest-declared region gets the event.
      if (region.rect.containsPoint(inverseCoords)) {
        ev.region = region;
      }
    }
    if (ev.region) {
      this.emit(eventType, ev);
    }
  }
};

/* istanbul ignore next */
Canvas.prototype.computeDocumentPosition = function() {
  var x = 0;
  var y = 0;
  var el = this.canvas;
  while (el.offsetParent) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent;
  }

  var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

  return {
    scroll: {x: scrollLeft, y: scrollTop},
    canvas: {x: x, y: y},
    toCanvasCoords: function(absX, absY) {
      return {
        x: absX - x,
        y: absY - y
      };
    }
  };
};


Canvas.prototype.resize = function(width, height, scaling) {
  scaling = scaling || 1;
  this.width = width;
  this.height = height;
  this.scaling = scaling;

  // DRY
  var ctx = this._ctx;
  var canvas = this.canvas;

  // Set the layout size
  /* istanbul ignore else */
  if (!canvas.style) {
    // JSDOM workaround
    canvas.style = {};
  }

  canvas.style.width = width * scaling + 'px';
  canvas.style.height = height * scaling + 'px';

  // Base scaling ratio from logical to physical
  var baseScaleRatio = scaling;

  // Calculate scaling ratio for devices with mismatched backing
  // store ratios and device pixel ratios.
  var devicePixelRatio = (typeof window === 'undefined' ? {} : window).devicePixelRatio || 1;
  var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;
  var backingScaleRatio = devicePixelRatio / backingStoreRatio;

  // Combined ratio to go from logical -> backing
  var ratio = this._ratio = backingScaleRatio * baseScaleRatio;

  // Scale the canvas size to deal with backing != device pixel sizes
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  // Set up a scale matrix so that logical units become backing units
  ctx.scale(ratio, ratio);

  // Fire off the post creation hook.  By default this is empty, but
  // different environments can extend it to do whatever it is they
  // need to do.  For example, adding fonts to a node.js canvas.
  this._postCreateHook();

  this.emit('resize', width, height, scaling);
};

/* istanbul ignore next */
Canvas.prototype.clear = function() {
  this.resetTransform();
  this._ctx.globalCompositeOperation = 'source-over';
  this._ctx.textAlign = 'left';
  this._ctx.globalAlpha = 1;
  this._ctx.clearRect(0, 0, this.width, this.height);
  this.textCache = [];
  this.regions = [];
};

Canvas.prototype._postCreateHook = function() {};


// Using interface defined in canvas.vgl

var delegate = function(m) {
  Canvas.prototype[m] = function() {
    return this._ctx[m].apply(this._ctx, arguments);
  };
};

/* istanbul ignore next */
var getset = function(virgilName, f, nativeName) {
  if (!nativeName) {
    nativeName = virgilName;
  }
  var name = virgilName[0].toUpperCase() + virgilName.substr(1);
  Canvas.prototype['set' + name] = function(v) {
    this._ctx[nativeName] = f ? f(v) : v;
  };
  Canvas.prototype['get' + name] = function() {
    return f ? f(this._ctx[nativeName]) : this._ctx[nativeName];
  };
};

/* istanbul ignore next */
var convertColor = function(c) {
  if (typeof c === 'string') {
    return c;
  } else {
    return c.toString();
  }
};

getset('fillColor', convertColor, 'fillStyle');
getset('strokeColor', convertColor, 'strokeStyle');
getset('globalAlpha');
getset('lineWidth');

delegate('setLineDash');
delegate('fillRect');
delegate('beginPath');
delegate('closePath');
delegate('stroke');
delegate('fill');

delegate('translate');
delegate('scale');
delegate('rotate');

delegate('arc');
delegate('rect');
delegate('bezierCurveTo');
delegate('quadraticCurveTo');
delegate('moveTo');
delegate('lineTo');
delegate('fillText');

delegate('clearRect');

// Modified

Canvas.prototype.fillText = function(text, x, y) {
  // The current transform has a base scale by the backing pixel ratio,
  // which we need to back out.
  var m = new AffineMatrix(this._ctx.currentTransform);
  m = new AffineMatrix().scale(this.scaling / this._ratio, this.scaling / this._ratio).multiply(m);
  m = m.translate(x, y);

  this.textCache.push({
    text: text,
    font: this._ctx.font,
    m: m
  });
  this._ctx.fillText(text, x, y);
};

/* istanbul ignore next */
Canvas.prototype.save = function() {
  this._saveCount++;
  this._ctx.save();
};

/* istanbul ignore next */
Canvas.prototype.restore = function() {
  if (this._saveCount-- > 0) {
    this._ctx.restore();
  }
  else {
    this._saveCount = 0;
  }
};

/* istanbul ignore next */
Canvas.prototype.resetTransform = function() {
  /* istanbul ignore else */
  if (this._ctx.resetTransform) {
    this._ctx.resetTransform();
  }
  else {
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  this._ctx.scale(this._ratio, this._ratio);
};

/* istanbul ignore next */
Canvas.prototype.drawTextLayout = function(spec, x, y) {
  var c = this;
  c.setFont(spec.font, spec.size);
  var yCur = y + spec.verticalOffset + (spec.size * 0.7);
  for (var i = 0; i < spec.lines.length; i++) {
    c.fillText(spec.lines[i].text, (x + spec.lines[i].left), yCur);
    yCur += spec.lines[i].lineHeight;
  }
};

/* istanbul ignore next */
Canvas.prototype.setFillGradient = function(grdspec) {
  if (grdspec && grdspec.grd) {
    this._ctx.fillStyle = grdspec.grd;
  }
};

/* istanbul ignore next */
Canvas.prototype.setStrokeGradient = function(grdspec) {
  if (grdspec && grdspec.grd) {
    this._ctx.strokeStyle = grdspec.grd;
  }
};


/* istanbul ignore next */
Canvas.prototype.setFont = function(fontSpec, size) {
  /* Note: this is a bare-bones minimal use
     of the font specification.  Only the
     name and size information is used at this time.
  */
  var fontTable = {
    sans: this.fontFamilySansSerif,
    serif: "serif",
    monospace: "monospace",
  };
  var fontCur = fontTable[fontSpec.family];
  this._ctx.font = fontSpec.weight + ' ' + size + 'px "' + fontCur + '"';
};

/* istanbul ignore next */
Canvas.prototype.measureTextWidth = function(str) {
  return this._ctx.measureText(str).width;
};

/* istanbul ignore next */
Canvas.prototype.startClip = function(x, y, w, h) {
  this._ctx.beginPath();
  this._ctx.rect(x, y, w, h);
  this._ctx.clip();
};

/* istanbul ignore next */
Canvas.prototype.setGlobalMaskMode = function(strMode) {
  switch (strMode) {
  case 'normal':
    this._ctx.globalCompositeOperation = 'source-over';
    break;
  case 'mask':
    this._ctx.globalCompositeOperation = 'source-atop';
    break;
  case 'reverse_mask':
    this._ctx.globalCompositeOperation = 'destination-over';
    break;
  default:
    console.log('setGlobalMaskMode received unknown global mask mode: ' + strMode);
    break;
  }
};

/* istanbul ignore next */
Canvas.prototype.endClip = function() {
  this._ctx.beginPath();
  this._ctx.rect(-Infinity, -Infinity, Infinity, Infinity);
  this._ctx.clip();
};

/* istanbul ignore next */
Canvas.prototype.drawImage = function(img, x, y) {
  if (!this.images[img]) {
    return;
  }

  this._ctx.drawImage(this.images[img], x, y);
};

/* istanbul ignore next */
Canvas.prototype.drawImageSized = function(img, x, y, w, h) {
  if (!this.images[img]) {
    return;
  }

  this._ctx.drawImage(this.images[img], x, y, w, h);
};

/* istanbul ignore next */
Canvas.prototype.createLinearGradient = function(xStart, yStart, xEnd, yEnd, colorStart, colorEnd) {
  var grd = this._ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
  grd.addColorStop(0, colorStart.toString());
  grd.addColorStop(1, colorEnd.toString());
  return new GradientSpec({grd: grd});
};

/* istanbul ignore next */
Canvas.prototype.createRadialGradient = function(xStart, yStart, radiusInner, radiusOuter, colorInner, colorOuter) {
  var grd = this._ctx.createRadialGradient(xStart, yStart, radiusInner, xStart, yStart, radiusOuter);
  grd.addColorStop(0, colorInner.toString());
  grd.addColorStop(1, colorOuter.toString());
  return new GradientSpec({grd: grd});
};


},{"./affine_matrix":8,"./gradient_spec":19,"./utils":28,"events":31,"util":36}],10:[function(require,module,exports){
var util = require('util');
var events = require('events');
var RenderContext = require('./render_context');
var TextLayoutEngine = require('./text_layout_engine');
var frame = require('./frame');
var PAUSED = 'paused';
var PLAYING = 'playing';
var ENDED = 'ended';

/* istanbul ignore next */
var Card = module.exports = function Card(canvas, creator, data) {
  events.EventEmitter.call(this);

  this._frame = null;
  this._offset = 0;
  this._start = -1;

  this.status = PAUSED;
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  var config = creator(data);
  this.data = config.data;
  this.duration = config.duration;
  this.renderer = config.renderer;
  this._performLayout = config.performLayout;
  this._needsLayout = true;
  this._layout = null;
  this._images = config.images || [];
  canvas.images = {};

  var pointerEvents = ['click', 'down', 'up', 'drag', 'hoveron', 'hoveroff'];
  for (var i = 0; i < pointerEvents.length; i++) {
    canvas.on(pointerEvents[i], this.emit.bind(this, pointerEvents[i]));
  }
  canvas.on('resize', function(width, height) {
    if (width !== this.width || height !== this.height) {
      this._needsLayout = true;
    }
    this.width = width;
    this.height = height;
  }.bind(this));
};
util.inherits(Card, events.EventEmitter);

/* istanbul ignore next */
Card.prototype.load = function(callback) {
  var waiting = this._images ? this._images.length : 0;
  var canvas = this.canvas;

  if (waiting === 0) {
    if (callback) {
      callback();
    }
    return;
  }

  if (this._images) {
    this._images.forEach(function(i) {
      var img = new Image();
      img.onload = function() {
        canvas.images[i] = img;
        waiting--;
        if (waiting === 0 && callback) {
          callback();
        }
      };
      img.onerror = function() {
        waiting--;
        if (waiting === 0 && callback) {
          callback();
        }
      };
      img.src = i;
    });
  }
};

// Reload the card by calling the newly passed in creator function
// This is used when the card is recompiled by the dev environment
Card.prototype.reload = function(creator, data) {
  var playing = this.status === PLAYING;
  if (playing) {
    this.pause();
  }
  var config = creator(data);
  this.data = config.data;
  this.duration = config.duration;
  this.renderer = config.renderer;
  this._performLayout = config.performLayout;
  this._needsLayout = true;

  this.frame(this._offset);
  if (playing) {
    this.play();
  }
};

Card.prototype.getTime = function() {
  var elapsed = 0;
  if (this.status === PLAYING) {
    elapsed = this._offset + (Date.now() - this._start);
  } else if (this.status === ENDED) {
    elapsed = this.duration;
  } else {
    elapsed = this._offset;
  }
  return Math.max(0, Math.min(this.duration, elapsed));
};

/* istanbul ignore next */
Card.prototype.frame = function(t, opts) {
  opts = opts || {};
  this.canvas.clear();

  if (this._needsLayout) {
    this._needsLayout = false;
    var tutil = new TextLayoutEngine(this.canvas);
    this._layout = this._performLayout && this._performLayout({width: this.width, height: this.height}, tutil, this.data);
  }

  var rc = new RenderContext();
  rc.update(t, this.duration);
  rc.c = this.canvas;
  rc.data = this.data;
  rc.layout = this._layout;
  this.renderer(rc);
  if (!opts.silent) {
    this.emit('frame', t);
  }
};

/* istanbul ignore next */
Card.prototype.play = function() {
  if (this.status === PLAYING) {
    return;
  }

  this.status = PLAYING;
  this._start = Date.now();

  // Render one frame immediately
  this.frame(this._offset);

  // .bind is not supported by Android 2.3 native browser:
  var self = this;

  // Frame handler
  var doFrame = function() {
    var diff = Date.now() - self._start + self._offset;
    self.frame(Math.min(diff, self.duration));

    // If we haven't hit the duration yet, carry on
    if (diff < self.duration) {
      self._frame = frame.next(doFrame);
    } else {
      self._frame = null;
      self._offset = 0;
      self.status = ENDED;
      self.emit('end');
    }
  };

  // Bootstrap
  this._frame = frame.next(doFrame);

  // Event
  this.emit('play');
};

/* istanbul ignore next */
Card.prototype.seek = function(t) {
  this._offset = t;
  this.emit('seek', t);
};

/* istanbul ignore next */
Card.prototype.pause = function() {
  if (this.status === PAUSED) {
    return;
  }

  if (this._frame !== null) {
    frame.cancel(this._frame);
    this._frame = null;
  }

  this._offset = Date.now() - this._start + this._offset;
  this._start = -1;
  this.status = PAUSED;
  this.emit('pause');
};

},{"./frame":17,"./render_context":26,"./text_layout_engine":27,"events":31,"util":36}],11:[function(require,module,exports){
module.exports = function CardConfig(other) {
  this.data = other ? other.data : null;
  this.duration = other ? other.duration : 0;
  this.renderer = other ? other.renderer : null;
  this.performLayout = other ? other.performLayout : null;
  this.images = other ? other.images : [];
};

},{}],12:[function(require,module,exports){
module.exports = function Clock(other) {
  this.fromStart = other ? other.fromStart : 0;
  this.fromEnd = other ? other.fromEnd : 0;
  this.duration = other ? other.duration : 0;
  this.percent = other ? other.percent : 0.0;
};

},{}],13:[function(require,module,exports){
var convert = function(n) {
  return (n * 255)|0;
};

var Color = module.exports = function Color(other) {
  this.r = other ? other.r : 0.0;
  this.g = other ? other.g : 0.0;
  this.b = other ? other.b : 0.0;
  this.a = other ? other.a : 1;

  if (typeof this.a === 'undefined') {
    this.a = 1;
  }
};

Color.prototype.toString = function() {
  return 'rgba(' + [this.r, this.g, this.b].map(convert).join(', ') +
    ', ' + this.a + ')';
};

},{}],14:[function(require,module,exports){
module.exports = function Config(other) {
  this.start = other ? other.start : 0;
  this.end = other ? other.end : 0;
  this.duration = other ? other.duration : -1;
  this.operations = other ? other.operations.slice() : [];
};

},{}],15:[function(require,module,exports){
var AffineMatrix = require('./affine_matrix');

/*
 * Polyfill for the `currentTransform` property on CanvasRenderingContext2D.
 * Doesn't return or require an instance of SVGMatrix.
 */
exports.shim = function(g) {
  var canvas = g.document &&
               g.document.createElement &&
               g.document.createElement('canvas');
  var ctx = canvas && canvas.getContext('2d');
  if (ctx && ctx.currentTransform) {
    return;
  }

  var proto = g.CanvasRenderingContext2D && g.CanvasRenderingContext2D.prototype;
  if (!proto) {
    return;
  }

  if ('currentTransform' in proto) {
    return;
  }

  if ('mozCurrentTransform' in proto || (ctx && ctx.mozCurrentTransform)) {
    // Bridge mozCurrentTransform which uses arrays, to use objects
    Object.defineProperty(proto, 'currentTransform', {
      configurable: true,
      enumerable: true,
      get: function() {
        return new AffineMatrix(this.mozCurrentTransform);
      }
    });

    return;
  }


  //// currentTransform management

  Object.defineProperty(proto, 'currentTransform', {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!this.__ctm__) {
        Object.defineProperty(this, '__ctm__', {
          configurable: false,
          enumerable: false,
          value: new AffineMatrix(),
          writable: true
        });
      }
      return this.__ctm__;
    }
  });


  var wrapAnd = function(name, f) {
    if (!proto[name]) {
      return;
    }
    var originalMethod = proto[name];
    proto[name] = function() {
      originalMethod.apply(this, arguments);
      f.apply(this, arguments);
    };
  };

  wrapAnd('setTransform', function(a, b, c, d, e, f) {
    this.__ctm__ = new AffineMatrix(a, b, c, d, e, f);
  });
  wrapAnd('resetTransform', function() {
    this.__ctm__ = new AffineMatrix();
  });
  wrapAnd('rotate', function(rad) {
    this.__ctm__ = this.currentTransform.rotate(rad);
  });
  wrapAnd('scale', function(x, y) {
    this.__ctm__ = this.currentTransform.scale(x, y);
  });
  wrapAnd('translate', function(x, y) {
    this.__ctm__ = this.currentTransform.translate(x, y);
  });
  wrapAnd('transform', function(a, b, c, d, e, f) {
    this.__ctm__ = this.currentTransform.multiply(new AffineMatrix(
      a, b, c, d, e, f
    ));
  });
  wrapAnd('save', function() {
    if (!this.__ctmStack__) {
      this.__ctmStack__ = [];
    }
    this.__ctmStack__.push(this.currentTransform);
  });
  wrapAnd('restore', function() {
    var ctm = null;
    if (this.__ctmStack__) {
      ctm = this.__ctmStack__.pop();
    }
    if (ctm) {
      this.__ctm__ = ctm;
    }
  });
};


},{"./affine_matrix":8}],16:[function(require,module,exports){
module.exports = { };

module.exports.Font = function Font(other) {
  this.name = (other && other.name) ? other.name : null;
  this.family = (other && other.family)? other.family : "sans";
  this.weight = (other && other.weight) ? other.weight : 300;
  this.italic = (other && (undefined !== other.italic)) ? other.italic : false;
  this.condensed = (other && (undefined !== other.condensed)) ? other.condensed : false;
};

module.exports.FontMetrics = function FontMetrics(other) {
  this.size = 0;
  this.xheight = 0;
  this.cap = 0;
  this.ascender = 0;
  this.descender = 0;
};

module.exports.TextLayout = function TextLayout(other) {
  this.font = other ? other.font : new module.exports.Font();
  this.size = other ? other.size : 0;
  this.contentHeight = other ? other.contentHeight : 0;
  this.verticalOffset = other ? other.verticalOffset : 0;
  this.lines = other ? other.lines : [];
  this.width = other ? other.width : 0;
  this.height = other ? other.height : 0;
};

module.exports.LineLayout = function LineLayout(other) {
  this.text = other ? other.text : "";
  this.left = other ? other.left : 0;
  this.width = other ? other.width : 0;
  this.lineHeight = other ? other.lineHeight : 0;
};

},{}],17:[function(require,module,exports){
/* jshint loopfunc:true */
var request = null;
var cancel = null;

// If we're in the browser, attempt to use RAF
// capabilities with a fallback to setTimeout.
/* istanbul ignore if */
if (typeof window !== 'undefined') {
  // Try normal RAF
  if (window.requestAnimationFrame) {
    request = function(callback) { return window.requestAnimationFrame(callback); };
    cancel = function(token) { return window.cancelAnimationFrame(token); };
  } else {
    // Fall back to vendor RAF
    var prefixes = ['o', 'ms', 'moz', 'webkit'];
    for (var i=0; i<prefixes.length; i++) {
      if (window[prefixes[i] + 'RequestAnimationFrame']) {
        request = function(callback) { return (window[prefixes[i] + 'RequestAnimationFrame'])(callback); };
        cancel = function(token) { return (window[prefixes[i] + 'CancelAnimationFrame'])(token); };
        break;
      }
    }

    // Last resort, use setTimeout
    if (!request || !cancel) {
      request = function(callback) { return window.setTimeout(callback, 16); };
      cancel = function(token) { return window.clearTimeout(token); };
    }
  }
}

exports.next = request;
exports.cancel = cancel;

},{}],18:[function(require,module,exports){
exports.Point = function Point(point) {
  this.x = point.x;
  this.y = point.y;
};

exports.Size = function Size(size) {
  this.width = size.width;
  this.height = size.height;
};

exports.Rect = function Rect(rect) {
  this.origin = rect.origin;
  this.size = rect.size;
};

exports.Rect.prototype.containsPoint = function containsPoint(point) {
  var rect = this;
  if (rect.origin.x <= point.x &&
    rect.origin.y <= point.y &&
    point.x <= rect.origin.x + rect.size.width &&
    point.y <= rect.origin.y + rect.size.height) {
    return true;
  } else {
    return false;
  }
};

},{}],19:[function(require,module,exports){
module.exports = function GradientSpec(other) {
  this.grd = (other && other.grd) ? other.grd : null;
};

},{}],20:[function(require,module,exports){
/* globals React */
module.exports = {
  // JSON
  JSON: require('./json'),
  parseJSON: function(s) { return new module.exports.JSON(s); },

  // Harness
  Clock: require('./clock'),
  RenderContext: require('./render_context'),
  Config: require('./config'),
  Card: require('./card'),
  CardConfig: require('./card_config'),
  Viz: require('./viz'),

  // Rendering
  Canvas: require('./canvas'),
  GradientSpec: require('./gradient_spec'),
  Color: require('./color'),
  Font: require('./fonts').Font,
  FontMetrics: require('./fonts').FontMetrics,
  LineLayout: require('./fonts').LineLayout,
  TextLayout: require('./fonts').TextLayout,
  TextLayoutEngine: require('./text_layout_engine'),

  // Geometry
  Point: require('./geometry').Point,
  Size: require('./geometry').Size,
  Rect: require('./geometry').Rect,

  // React integration
  react: require('./react')(typeof React !== 'undefined' ? React : undefined)
};

},{"./canvas":9,"./card":10,"./card_config":11,"./clock":12,"./color":13,"./config":14,"./fonts":16,"./geometry":18,"./gradient_spec":19,"./json":23,"./react":24,"./render_context":26,"./text_layout_engine":27,"./viz":29}],21:[function(require,module,exports){
(function (__dirname){
exports = module.exports = require('./index');

// Try/Catch is needed in order for this to be used by
// the karma-based test system of crossover, which does NOT
// use browserify and thus will choke on the require('path').
try { 
  var path = require('path');
  exports.BROWSER_JS_PATH = path.join(__dirname, '..', 'release', 'vizify.js');
}
catch(e){
  // console.log("vizify-javascript: index_node.js is not running a browserified environment..");
  //
  // So we don't have access to the path module.  So what?  Can't we go on without it?
  // It would seem so at first glance, but...
  //
  // Unfortunately, in order to bring release/vizify.js into the karma/phantomJS environment,
  // we have to use this crazy path:
  //    exports.BROWSER_JS_PATH = require(__dirname + '/../../../../node_modules/vizify-javascript/release/vizify.js');
  // since the POV of the __dirname is from the react component's test harness.
  //
  // No need to sweat this out... I prefer to simply use the require('./index') to bring V-J into the test environment.
  // This has been found to be a fully-operational way to bring V-J into the test phantomJS instance.
}

}).call(this,"/node_modules/vizify-javascript/lib")

},{"./index":20,"path":33}],22:[function(require,module,exports){
/**
 * 3x3 matrix inversion function snipped from gl-matrix:
 * https://github.com/toji/gl-matrix/
 */

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE. */

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
/* istanbul ignore next */
var invert = function(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2],
    a10 = a[3], a11 = a[4], a12 = a[5],
    a20 = a[6], a21 = a[7], a22 = a[8],

    b01 = a22 * a11 - a12 * a21,
    b11 = -a22 * a10 + a12 * a20,
    b21 = a21 * a10 - a11 * a20,

  // Calculate the determinant
    det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
};

module.exports = invert;

},{}],23:[function(require,module,exports){
var Json = module.exports = function Json(json, raw) {
  this.value = raw ? json : JSON.parse(json);
};

var doThrow = function(v, type) {
  throw new Error('JSON node is type ' + (typeof value) + ', cannot convert to ' + type);
};

Json.prototype.get = function(key) {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot get child node');
  }

  return new Json(this.value[key], true);
};

Json.prototype.asStr = function() {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot convert to string');
  }
  if (typeof this.value !== 'string') {
    doThrow(this.value, 'string');
  }

  return this.value.toString();
};

Json.prototype.asInt = function() {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot convert to int');
  }

  switch (typeof this.value) {
    case 'string':
      return parseInt(this.value, 10) || 0;
    case 'number':
      return this.value|0;
    default:
      doThrow(this.value, 'int');
  }
};

Json.prototype.asFloat = function() {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot convert to float');
  }

  switch (typeof this.value) {
    case 'string':
      return parseFloat(this.value) || 0;
    case 'number':
      return this.value;
    default:
      doThrow(this.value, 'float');
  }
};

Json.prototype.asBool = function() {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot convert to bool');
  }
  if (typeof this.value !== 'boolean') {
    doThrow(this.value, 'bool');
  }

  return this.value;
};

Json.prototype.asList = function() {
  if (this.value === null) {
    throw new Error('JSON node is null, cannot convert to list');
  }
  if ((typeof this.value !== 'object') || (!(this.value instanceof Array))) {
    doThrow(this.value, 'list');
  }
  if (!(this.value.map)) {
    return [];
  }else{
    return this.value.map(function(v) { return new Json(v, true); });
  }
};

Json.prototype.isNull = function() {
  return this.value === null || this.value === undefined;
};

},{}],24:[function(require,module,exports){
var Viz = require('./viz');

/* istanbul ignore next */
function createComponentClass(React) {
  return React.createClass({
    displayName: 'VizifyComponent',

    propTypes: {
      card: React.PropTypes.func.isRequired,
      data: React.PropTypes.string.isRequired,
      cardSizingSpec: React.PropTypes.object.isRequired,
      autoplay: React.PropTypes.bool,
      initialTime: React.PropTypes.number,
      isVariableHeight: React.PropTypes.bool,
      width: React.PropTypes.number,
      height: React.PropTypes.number
    },

    getDefaultProps: function() {
      return {
        autoplay: true,
        initialTime: 0
      };
    },

    getInitialState: function() {
      return {
        time: this.props.initialTime,
        computedWidth: this.props.width,
        computedHeight: this.props.height
      };
    },

    computeCanvasSize: function() {
      // Sizing: Try to figure out available dimensions from props
      var availableWidth = this.props.width;
      var availableHeight = this.props.height;
      var availableAspectRatio;

      // Fallback to DOM layout dimensions
      var node = this.isMounted() && this.refs.container.getDOMNode();
      if (node && !availableWidth) {
        availableWidth = node.clientWidth;
      }
      if (node && !availableHeight) {
        availableHeight = node.clientHeight;
      }

      if (!availableWidth && !availableHeight) {
        return {
          width: this.props.cardSizingSpec.width,
          height: this.props.cardSizingSpec.height
        };
      }

      // Normalize all falsey values to zero
      availableWidth = availableWidth || 0;
      availableHeight = availableHeight || 0;

      // The natural dimensions of the card
      var cardSizingSpec = this.props.cardSizingSpec;
      var cardWidth = cardSizingSpec.width;
      var cardHeight = cardSizingSpec.height;
      var cardAspectRatio = cardWidth / cardHeight;

      // The final dimensions of the canvas into which the card will be rendered.
      var canvasWidth = cardWidth;
      var canvasHeight = cardHeight;

      if (cardSizingSpec.resizingMode === "contain") {
        // If availableHeight is 0, assume unconstrained height
        availableAspectRatio = availableHeight > 0 ? availableWidth / availableHeight : Number.MIN_VALUE;
        if (availableAspectRatio > cardAspectRatio) {
          // If given area's aspect ratio is greater than the card's
          // intrinsic ratio, we are height-constrained.
          canvasHeight = availableHeight;
          canvasWidth = availableHeight * cardAspectRatio;
        } else {
          // Otherwise, we are width-constrained.
          canvasWidth = availableWidth;
          canvasHeight = availableWidth / cardAspectRatio;
        }
      } else if (cardSizingSpec.resizingMode === "fill") {
        // Just stretch to fill the given space...
        canvasWidth = availableWidth;
        canvasHeight = availableHeight;
        if (availableHeight === 0) {
          // ... unless the given space has zero height, in which case we respect the aspect ratio.
          canvasHeight = availableWidth / cardAspectRatio;
        }
      }

      return {
        width: canvasWidth,
        height: canvasHeight
      };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      // If size changed, YES should update
      if (this.state.computedWidth !== nextState.computedWidth || this.state.computedHeight !== nextState.computedHeight) {
        return true;
      }
      if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
        return true;
      }
      if (this.props.cardSizingSpec.width !== nextProps.cardSizingSpec.width || this.props.cardSizingSpec.height !== nextProps.cardSizingSpec.height) {
        return true;
      }
      if (this.props.cardSizingSpec.resizingMode !== nextProps.cardSizingSpec.resizingMode) {
        return true;
      }

      // If data payload changed, YES should update
      if (nextProps.data !== this.props.data) {
        return true;
      }

      return false;
    },

    componentDidUpdate: function(prevProps /*, prevState*/) {
      var dimensions = this.computeCanvasSize();

      if (prevProps.data !== this.props.data) {
        this.viz.reload(this.props.data);
        this.viz.seek(0);
        this.viz.play();
      }

      this.viz.resize(dimensions.width, dimensions.height, this.viz.canvas.scaling);
      this.setState({
        computedWidth: dimensions.width,
        computedHeight: dimensions.height
      });
    },

    componentDidMount: function() {
      var dimensions = this.computeCanvasSize();
      var viz = this.viz = new Viz(this.props.card, dimensions.width, dimensions.height, 1, this.props.data);
      this.refs.container.getDOMNode().appendChild(viz.element);
      this.setState({
        computedWidth: dimensions.width,
        computedHeight: dimensions.height
      });

      if (this.props.autoplay) {
        viz.load(function() {
          viz.seek(this.state.time);
          viz.play();
        }.bind(this));
      }

      // Backwards compatibility
      this.canvas = this.viz.canvas;
      this.card = this.viz.card;
    },

    componentWillUnmount: function() {
      if (this.viz) {
        this.viz.pause();
      }
      this.viz = null;
      this.card = null;
      this.canvas = null;
    },

    render: function() {
      // If variable height, pre-allocate space based on width. This is done
      // specially to avoid a height pop on initial document layout.
      // See: http://alistapart.com/article/creating-intrinsic-ratios-for-video
      if (this.props.isVariableHeight) {
        return React.DOM.div( // Container to set the width
          {
            className: "vizify-component",
            style: {
              position: "relative",
              width: this.state.computedWidth,
              height: this.state.computedHeight
            }
          },
          React.DOM.div( // Container to set height based by using padding hax
            {
              style: {
                position: "relative",
                width: "100%",
                paddingBottom: this.props.cardSizingSpec.height / this.props.cardSizingSpec.width * 100 + "%",
                height: 0
              }
            },
            React.DOM.div({
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
              },
              ref: "container"
            })
          )
        );
      }

      // Default behavior is to use the explicit width/height and fall back to computed w/h based on CSS.
      return React.DOM.div({
        className: "vizify-component",
        ref: "container",
        style: {
          width: this.state.computedWidth,
          height: this.state.computedHeight
        }
      });
    }

  });
}

module.exports = function(React) {
  var result = {};

  if (typeof React !== 'undefined') {
    result.VizifyComponent = createComponentClass(React);
  }

  return result;
};

},{"./viz":29}],25:[function(require,module,exports){
var throttle = require('./utils').throttle;
var invertCoordinates = require('./utils').invertCoordinates;

/* istanbul ignore next */
module.exports = function hover(viz) {
  var canvas = viz.canvas;
  var computePos = throttle(canvas.computeDocumentPosition.bind(canvas), 300);
  var previousActiveRegion;
  var onMouseOver, onMouseLeave, onMouseMove;

  onMouseOver = onMouseMove = function(ev) {
    ev.preventDefault();

    if (!canvas.regions || canvas.regions.length === 0) {
      return;
    }

    var now = Date.now();

    var pos = computePos();
    var canvasCoords = pos.toCanvasCoords(ev.clientX, ev.clientY);
    var inverseCoords;
    var region;
    var activeRegion;
    var syntheticEvent;

    for (var i = 0; i < canvas.regions.length; i += 1) {
      region = canvas.regions[i];
      inverseCoords = invertCoordinates(canvasCoords, region.transform);
      // TODO consider overlapping regions in the future.
      // Currently latest-declared region gets the event.
      if (region.rect.containsPoint(inverseCoords)) {
        activeRegion = region;
      }
    }

    if (activeRegion && previousActiveRegion && activeRegion.name === previousActiveRegion.name) {
      // Continuation, do nothing
      previousActiveRegion = activeRegion;
      return;
    }
    if (previousActiveRegion) {
      // We've hovered off the previous region
      syntheticEvent = {
        stopPropagation: function() {},
        preventDefault: function() {},
        target: ev.target,
        absolute: {x: ev.clientX, y: ev.clientY, t: now},
        region: previousActiveRegion
      };
      canvas.emit('hoveroff', syntheticEvent);
    }
    if (activeRegion) {
      // We've hovered onto a new region
      syntheticEvent = {
        stopPropagation: function() {},
        preventDefault: function() {},
        target: ev.target,
        absolute: {x: ev.clientX, y: ev.clientY, t: now},
        region: activeRegion
      };
      canvas.emit('hoveron', syntheticEvent);
    }

    previousActiveRegion = activeRegion;
  };

  onMouseLeave = function(ev) {
    ev.preventDefault();

    var syntheticEvent;
    if (previousActiveRegion) {
      syntheticEvent = {
        stopPropagation: function() {},
        preventDefault: function() {},
        target: ev.target,
        absolute: {x: ev.clientX, y: ev.clientY, t: Date.now()},
        region: previousActiveRegion
      };
      canvas.emit('hoveroff', syntheticEvent);
    }
    previousActiveRegion = null;
  };

  var vizEl = viz.element;
  vizEl.addEventListener('mouseover', onMouseOver);
  vizEl.addEventListener('mouseleave', onMouseLeave);
  vizEl.addEventListener('mousemove', onMouseMove);

  return function() {
    vizEl.removeEventListener('mousemove', onMouseMove);
    vizEl.removeEventListener('mouseleave', onMouseLeave);
    vizEl.removeEventListener('mouseover', onMouseOver);
  };
};

},{"./utils":28}],26:[function(require,module,exports){
var Clock = require('./clock');
var Config = require('./config');

var RenderContext = module.exports = function RenderContext(skipDefaults) {
  if (!skipDefaults) {
    this.clock = new Clock();
    this.config = new Config();
  }
};

RenderContext.prototype.fork = function() {
  var rc = new RenderContext();
  rc.c = this.c;
  rc.data = this.data;
  rc.layout = this.layout;
  rc.config = new Config(this.config);
  rc.clock = new Clock(this.clock);

  return rc;
};

RenderContext.prototype.update = function(elapsed, total) {
  this.clock.fromStart = elapsed;
  this.clock.fromEnd = total - elapsed;
  this.clock.percent = elapsed / total;
  this.clock.duration = total;
};

RenderContext.prototype.setRegion = function(name, rect) {
  this.c.regions.push({
    name: name,
    rect: rect,
    // TODO this is cheating
    transform: this.c._ctx.currentTransform
  });
};

},{"./clock":12,"./config":14}],27:[function(require,module,exports){
var TextLayoutEngine = module.exports = function TextLayoutEngine(canv) {
  this.canvas = canv;
};

/* istanbul ignore next */
TextLayoutEngine.prototype.measureTextWidth = function(text, fontSpec, fontSize) {
  var c = this.canvas;
  c.save();
  c.setFont(fontSpec, fontSize);
  var retval = c.measureTextWidth(text);
  c.restore();
  return retval;
};

},{}],28:[function(require,module,exports){
var AffineMatrix = require('./affine_matrix');

/**
 * Poor man's throttle
 * @param {Function} fn
 * @param {Number} waitInterval Minimum time between new calls to `fn`, in milliseconds.
 * @return {Function} Runs `fn` and returns the result. If throttled, returns the results of the previous run.
 */
exports.throttle = function(fn, waitInterval) {
  var lastCalledTime;
  var lastResult;
  return function() {
    var now = Date.now();
    if (lastCalledTime) {
      if (now - lastCalledTime < waitInterval) {
        return lastResult;
      }
    }

    lastCalledTime = now;
    lastResult = fn.apply(this, arguments);
    return lastResult;
  };
};

/**
 * Given a point and a transform matrix, returns a new point in the same coordinate space which when multiplied
 * by the transform matrix, returns the given point. Essentially P(T^-1)
 * @param {Point} coordinates A point in the current space.
 * @param {Object} transform Transform matrix to compute the inverse of.
 * @return {{x: number, y: number}}
 */
exports.invertCoordinates = function(coordinates, transform) {
  var inverseMatrix = new AffineMatrix(transform).inverse();
  return inverseMatrix.multiplyVector(coordinates);
};

},{"./affine_matrix":8}],29:[function(require,module,exports){
/*globals vz*/
var util = require('util'),
    events = require('events'),
    Canvas = require('./canvas'),
    Card = require('./card'),
    hover = require('./region-hover');

if (typeof window !== 'undefined') {
  require('../static/vztouch');
  require('./current_transform_shim').shim(window);
}

// Add text highlighting styling specifically for Firefox, since
// our transparent text remains transparent when highlighted in FF.
// Only way to do this is to use the CSSOM, since modifying pseudo
// elements via JS directly on elements is impossible.
if (typeof document !== 'undefined' && typeof document.styleSheets !== 'undefined') {
  document.head.appendChild(document.createElement('style'));
  var styleSheet = document.styleSheets[document.styleSheets.length - 1];
  try {
    styleSheet.insertRule('._vz-txt-holder::-moz-selection { background-color: rgba(255, 255, 255, 0.3); }', 0);
  } catch (err) {}
}

//
// Prefix a style property
//
var prefix = function(el, prop, val) {
  var propU = prop.charAt(0).toUpperCase() + prop.substr(1);
  ['O', 'ms', 'Moz', 'Webkit'].forEach(function(prefix) {
    el.style[prefix + propU] = val;
  });
  el.style[prop] = val;
};

/* istanbul ignore next */
var Viz = module.exports = function Viz(cardEntryPoint, width, height, scale, data) {
  events.EventEmitter.call(this);
  var self = this;

  if (typeof width !== 'number') {
    data = width;
    width = undefined;
    height = undefined;
    scale = undefined;
  } else if (typeof height !== 'number') {
    data = height;
    height = undefined;
    scale = undefined;
  } else if (typeof scale !== 'number') {
    data = scale;
    scale = undefined;
  }

  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }

  // Basic setup
  this.entryPoint = cardEntryPoint;
  this.data = data;
  this.element = document.createElement('div');
  this.canvas = new Canvas(width || 300, height || 300, scale || 1);
  this.element.appendChild(this.canvas.canvas);
  this.card = new Card(this.canvas, this.entryPoint, this.data);

  // Wrapper styling
  var s = this.element.style;
  s.display = 'inline-block';
  s.position = 'relative';
  s.width = this.canvas.canvas.style.width;
  s.height = this.canvas.canvas.style.height;
  s.overflow = 'hidden';
  s = this.canvas.canvas.style;
  s.position = 'absolute';
  s.top = '0';
  s.left = '0';

  // Event proxying
  var proxyEvent = function(name) {
    self.card.on(name, function() {
      self.emit.apply(self, [name].concat(Array.prototype.slice.call(arguments)));
    });
  };
  proxyEvent('seek');
  proxyEvent('play');
  proxyEvent('pause');
  proxyEvent('end');
  proxyEvent('frame');

  var proxyClick = function (e) {
    this.canvas.regionEventListener('click', e);
  };

  // Accessibility
  this.card.on('pause', this._applyText.bind(this));
  this.card.on('end', this._applyText.bind(this));
  this.removeVzTouch = vz.touch(this.element, null, {
    click: proxyClick.bind(this)
  });
  this.removeHover = hover(this);
};
util.inherits(Viz, events.EventEmitter);

var proxyCard = function(name) {
  Viz.prototype[name] = function() {
    return this.card[name].apply(this.card, arguments);
  };
};

Viz.prototype._applyText = function(hidden) {
  var self = this;

  while (self.element.childNodes.length > 1) {
    self.element.removeChild(self.element.childNodes[1]);
  }

  self.canvas.textCache.forEach(function(tc) {
    var el = document.createElement('div');
    el.className = '_vz-txt-holder';
    if (hidden) {
      el.style.display = 'none';
    }
    el.style.position = 'absolute';
    el.style.left = 0;
    el.style.top = 0;
    el.style.font = tc.font;
    el.style.lineHeight = tc.font.match(/(\d+px)/)[1];
    el.style.color = 'transparent';
    el.style.whiteSpace = 'nowrap';
    // Baseline hack
    // FIXME - Use text metrics to align properly
    el.style.marginTop = parseInt(el.style.lineHeight, 10) * -0.85 + 'px';

    // Apply the text's transform
    prefix(el, 'transformOrigin', 'left');
    prefix(el, 'transform', 'matrix(' + [
      tc.m.a, tc.m.b, tc.m.c, tc.m.d, tc.m.e, tc.m.f
    ].join(', ') + ')');

    el.appendChild(document.createTextNode(tc.text));
    self.element.appendChild(el);
  });
};

Viz.prototype.reload = function(entryPoint, data) {
  if (typeof entryPoint !== 'function') {
    data = entryPoint;
    entryPoint = undefined;
  }

  if (!data) {
    data = this.data;
  }
  if (!entryPoint) {
    entryPoint = this.entryPoint;
  }

  return this.card.reload(entryPoint, data);
};

Viz.prototype.resize = function(width, height, scale) {
  this.canvas.resize(width, height, scale);
  this.element.style.width = this.canvas.canvas.style.width;
  this.element.style.height = this.canvas.canvas.style.height;
};

Viz.prototype.scale = function(scale) {
  this.resize(this.canvas.width, this.canvas.height, scale);
};

Viz.prototype.load = function(callback) {
  this.card.load(function() {
    // Load up text from the last frame
    try {
      this.frame(this.duration - 1);
      this._applyText(true);
    } catch (err) {} // Ignore errors and carry on
    this.canvas.clear();
    callback();
  }.bind(this));
};

proxyCard('getTime');
proxyCard('frame');
proxyCard('play');
proxyCard('seek');
proxyCard('pause');

},{"../static/vztouch":30,"./canvas":9,"./card":10,"./current_transform_shim":15,"./region-hover":25,"events":31,"util":36}],30:[function(require,module,exports){
'use strict';

//
// Quick usage:
//
//     vz.touch(el, [options], events);
//
//  * el - A DOM element, or array-like container of DOM elements (e.g.
//         jQuery, Array, NodeList).
//
//  * options - Optional map of options to use.  See below for details.
//
//  * events - Map of events to bind.  Supported events: click down up
//             drag.
//
// Event handler work largely like regular old DOM event handlers.  The
// `this` object is set to the target of the event, and a single event
// argument is passed through defined below.  Note that `preventDefault`
// is always called before the event is passed to the handler, but a
// dummy `preventDefault` method is still provided for compatibility.
//
// Event interface:
// {
//   stopPropagation: function,
//   preventDefault: dummy function,
//   target: target element,
//   absolute/relative/delta: {
//     t: time
//     x: window x position
//     y: window y position
//   }
//   dragState: 0|1|2 // starting, continuing, ended
// }
//
// Note that relative, delta, and dragState ONLY appear for drag events
//
// Options:
//
//   * `selector` - If present,
//     events will only be handled if the target matches `selector`.  This
//     can to used to, for example, bind vztouch to `document.body` and
//     handle events on all `a` tags.  Note that this requires recent
//     browsers in order to function, notably IE9+.
//
//   * `dragDirection` - If `'vertical'` or `'horizontal'`, dragging is
//     locked to that particular axis.  Attempting to drag in the other
//     direction will cause native browser behavior (e.g. scrolling on
//     a mobile device).
//

(function() {

  ///////////////////////////////////////////////
  // Utility
  ///////////////////////////////////////////////

  var matchesSelector = function() {
    var name = undefined;
    var prefixii = 'webkit moz ms o'.split(/\s+/);
    return function(el, sel) {
      if (name === undefined) {
        name = null;

        if (typeof el.matches == 'function') {
          name = 'matches';
        } else {
          prefixii.forEach(function(p) {
            if (typeof el[p + 'MatchesSelector'] == 'function')
              name = p + 'MatchesSelector';
          });
        }
      } else if (name === null) {
        return false;
      } else {
        return el[name](sel);
      }
    };
  }();

  ///////////////////////////////////////////////
  // Internal flags
  ///////////////////////////////////////////////

  // When true, click events will be fully emulated and the native
  // click event never bound.
  var ignoreNativeClick = false;

  // Sets how many pixels along an axis must be moved to consider an
  // action a drag.
  var DRAG_THRESHOLD = 3;

  // If we're using the stock android browser, we *cannot* bind to
  // click events because the touch events cannot be properly cancelled.
  if (navigator.userAgent.match(/Android/) && !navigator.userAgent.match(/Firefox|Chrome/))
    ignoreNativeClick = true;

  // Does extra logging when set
  var DEBUG = false;

  /////////////////////////////////////////////
  // Public Interface
  /////////////////////////////////////////////

  // Ensure namespace exists
  if (!window.vz)
    window.vz = {};

  // Event types: down, up, drag, click
  vz.touch = function(el, opts, events) {
    // Sanity
    if (!el || el.length === 0)
      return function() {};

    // Handle jQuery, arrays, etc
    if (el.length) {
      var cleanups = [];
      for (var i=0; i<el.length; i++)
        cleanups.push(vz.touch(el[i], opts, events));
      return function() {
        for (var i=0; i<cleanups.length; i++)
          cleanups[i]();
      };
    }

    // Opts is optional
    if (!events) {
      events = opts;
      opts = undefined;
    }
    if (!opts)
      opts = {};

    // If events is a function, treat it as shorthand syntax for just
    // binding click.
    if (typeof events == 'function')
      events = {click: events};

    // Validate events and options
    for (var i in events) if (events.hasOwnProperty(i))
      if (['down', 'up', 'drag', 'click'].indexOf(i) < 0)
        throw new Error('Unsupported event "' + i + '"');
    for (var i in opts) if (opts.hasOwnProperty(i))
      if (['dragDirection', 'selector'].indexOf(i) < 0)
        throw new Error('Unsupported option "' + i + '"');

    ////////////////////////////////////////////////////
    // Implementation
    ////////////////////////////////////////////////////

    // Drag state
    var dragInfo = {
      // Start pos
      sx: 0,
      sy: 0,
      // Current pos
      x: 0,
      y: 0,
      // Total movement
      tx: 0,
      ty: 0,

      // Start time
      sd: 0,
      // Current time
      d: 0,
      // Total time
      td: 0,

      // Target drag element
      target: null,

      // Current drag state
      state: 0,
    };

    // Gets controlled by drag and touch events.  When drag goes over
    // a threshold the next click is ignored.  When a touchend finishes
    // WITHIN threshold it will fire click instantly and set this so
    // that the regular touch event doesn't occur.
    var ignoreThisClick = false;

    // Gets toggled by the drag listener if directional dragging is enabled
    var ignoreThisDrag = false;

    // When true, drag events are bound to the window.  Reset after
    // a drag ends.
    var dragEventsBound = true;

    // When true, we have sent a drag event to the user and will need
    // to follow up by sending a final null drag to signal the end.
    var dragFired = false;

    // Special handler for preventing text selection while dragging
    var selectionKiller = function(e) {
      if (DEBUG)
        console.log('selectionKiller');

      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Gets the window position of an event
    var getPosX = function(e) {
      if (e.touches && e.touches.length)
        return e.touches[0].pageX;
      else if (!e.touches && typeof e.pageX == 'number')
        return e.pageX;
      else if (!e.touches && typeof e.clientX == 'number')
        return e.clientX + document.body.scrollLeft;
      else
        return undefined;
    };
    var getPosY = function(e) {
      if (e.touches && e.touches.length)
        return e.touches[0].pageY;
      else if (!e.touches && typeof e.pageY == 'number')
        return e.pageY;
      else if (!e.touches && typeof e.clientY == 'number')
        return e.clientY + document.body.scrollTop;
      else
      return undefined;
    };

    // Special handler for ending drags regardless of where the cursor is
    var dragEnder = function(e) {
      if (DEBUG)
        console.log('dragEnder', e ? e.type : undefined);

      window.removeEventListener('mousemove', drag, false);
      window.removeEventListener('touchmove', drag, false);
      window.removeEventListener('mouseup', dragEnder, true);
      window.removeEventListener('touchend', dragEnder, true);
      window.removeEventListener('selectstart', selectionKiller, true);

      if (dragEventsBound) {
        dragEventsBound = false;
        if (events.drag && dragFired) {
          dragFired = false;
          var data = {
            stopPropagation: function() { e && e.stopPropagation(); },
            preventDefault: function() {},
            target: dragInfo.target,
            absolute: {x: dragInfo.x, y: dragInfo.y, t: +new Date()},
            relative: {x: dragInfo.x - dragInfo.sx,
                       y: dragInfo.y - dragInfo.sy,
                       t: (+new Date()) - dragInfo.st
                      },
            delta: {x: 0, y: 0, t: (+new Date()) - dragInfo.t},
            dragState: 2
          };
          if (opts.dragDirection == 'horizontal') {
            data.absolute.y =
            data.relative.y =
            data.delta.y = 0;
          } else if (opts.dragDirection == 'vertical') {
            data.absolute.x =
            data.relative.x =
            data.delta.x = 0;
          }
          events.drag.call(dragInfo.target, data);
        }
      }
    };

    var down = function(e) {
      if (DEBUG)
        console.log('down', e.type);
      if (opts.selector && !matchesSelector(e.target, opts.selector))
        return;

      // Ignore multitouches or non-primary mousebutton clicks
      if ((e.touches && e.touches.length > 2) || (e.button !== undefined && e.button !== 0))
        return;

      // This is the start of a new click; don't ignore it
      ignoreThisClick = false;

      // If the user's listening for down events, pass on through
      if (events.down) {
        e.preventDefault();
        events.down.call(this, {
          stopPropagation: function() { e.stopPropagation(); },
          preventDefault: function() {},
          target: e.target,
          absolute: {
            x: getPosX(e),
            y: getPosY(e),
            t: +new Date()
          }
        });
      }

      // Re-enable drag listenering
      ignoreThisDrag = false;

      // For dragging via mouse-type events, disable text selection.
      if (events.drag && e.type == 'mousedown') {
        e.preventDefault();
      }

      // For drag events bootstrap the position and element.  Touchstart
      // is similar, because we need to track the start of a potential
      // "click" event.
      if (events.drag || e.type == 'touchstart') {

        // Set drag starting coordinates
        dragInfo.sx = getPosX(e);
        dragInfo.sy = getPosY(e);
        dragInfo.x = dragInfo.sx;
        dragInfo.y = dragInfo.sy;
        dragInfo.tx = 0;
        dragInfo.ty = 0;
        dragInfo.t = dragInfo.st = +new Date();
        dragInfo.target = e.target;
        dragInfo.state = 0;

        // Bind to drag events
        window.addEventListener('mousemove', drag, false);
        window.addEventListener('touchmove', drag, false);
        window.addEventListener('mouseup', dragEnder, true);
        window.addEventListener('touchend', dragEnder, true);
        window.addEventListener('selectstart', selectionKiller, true);
        dragEventsBound = true;
      }
    };

    var up = function(e) {
      if (DEBUG)
        console.log('up', e.type);
      if (opts.selector && !matchesSelector(e.target, opts.selector))
        return;

      var x = 0;
      var y = 0;
      if (events.click || events.up) {
        x = getPosX(e);
        y = getPosY(e);
        if (!x && x !== 0)
          x = dragInfo.x;
        if (!y && y !== 0)
          y = dragInfo.y;
      }

      // If the user's listening for up events, pass on through
      if (events.up) {
        e.preventDefault();
        events.up.call(this, {
          stopPropagation: function() { e.stopPropagation(); },
          preventDefault: function() {},
          target: e.target,
          absolute: {
            x: x,
            y: y,
            t: +new Date()
          }
        });
      }

      // Optimized click delivery
      if (events.click && !ignoreThisClick) {
        // If we're ignoring native click, simulate a click event.
        // Similarly, if this event came from a touchend, we can trigger
        // our own click and ignore the real click event, which will
        // give snappier performance.
        if (ignoreNativeClick || e.type == 'touchend') {
          e.preventDefault();
          ignoreThisClick = true;
          events.click.call(this, {
            stopPropagation: function() { e.stopPropagation(); },
            preventDefault: function() {},
            target: e.target,
            absolute: {
              x: x,
              y: y,
              t: +new Date()
            }
          });
        }
      }
    };

    var click = function(e) {
      if (DEBUG)
        console.log('click', e.type);
      if (opts.selector && !matchesSelector(e.target, opts.selector))
        return;

      if (!ignoreThisClick && events.click) {
        e.preventDefault();
        events.click.call(this, {
          stopPropagation: function() { e.stopPropagation() },
          preventDefault: function() {},
          target: e.target,
          absolute: {
            x: getPosX(e),
            y: getPosY(e),
            t: +new Date()
          }
        });
      }
    };

    var drag = function(e) {
      if (DEBUG)
        console.log('drag', e.type);

      // Don't handle multitouch
      if (e.touches && e.touches.length > 1)
        return;

      // If we're ignoring the drag, there's nothing to do
      if (ignoreThisDrag)
        return;

      // New position
      var nx = getPosX(e);
      var ny = getPosY(e);

      // New date
      var nt = +new Date();

      // Prep the data to pass to the client
      var data = {
        stopPropagation: function() { e.stopPropagation() },
        preventDefault: function() {},
        target: dragInfo.target,
        absolute: {x: nx, y: ny, t: nt},
        relative: {x: nx - dragInfo.sx, y: ny - dragInfo.sy, t: nt - dragInfo.st},
        delta: {x: nx - dragInfo.x, y: ny - dragInfo.y, t: nt - dragInfo.t},
        dragState: dragInfo.state
      };

      // When limiting to one axis, ignore the other axis' values
      if (opts.dragDirection == 'horizontal') {
        data.absolute.y =
        data.relative.y =
        data.delta.y = 0;
      } else if (opts.dragDirection == 'vertical') {
        data.absolute.x =
        data.relative.x =
        data.delta.x = 0;
      }

      // Update the last position
      dragInfo.t = nt;
      dragInfo.x = nx;
      dragInfo.y = ny;
      dragInfo.tx += Math.abs(data.delta.x);
      dragInfo.ty += Math.abs(data.delta.y);

      // If we're limiting dragging to one axis, check for the direction of the first
      // drag event to make a decision.
      if (data.dragState == 0) {
        if (opts.dragDirection == 'vertical') {
          if (dragInfo.ty < dragInfo.tx) {
            ignoreThisDrag = true;
            return;
          }
        } else if (opts.dragDirection == 'horizontal') {
          if (dragInfo.tx < dragInfo.ty) {
            ignoreThisDrag = true;
            return;
          }
        }
      }

      // When true, we've passed the drag threshold and are treating
      // this drag as a drag and not a sloppy data.
      var overThreshold = (dragInfo.tx > DRAG_THRESHOLD) || (dragInfo.ty > DRAG_THRESHOLD);

      // If we've moved more than the drag threshold on either axis, stop
      // click from happening.
      if (!ignoreThisClick && overThreshold)
        ignoreThisClick = true;

      // If we've moved more than the drag treshold on the configured
      // axis (both by default), prevent native scroll from working and
      // then drigger the drag business.
      if (events.drag && overThreshold) {
        e.preventDefault();

        // Pass the drag event on down
        if (events.drag) {
          events.drag.call(dragInfo.target, data);
          dragFired = true;
          dragInfo.state = 1;
        }
      }
    };

    // Bind all our events
    el.addEventListener('touchstart', down, false);
    el.addEventListener('touchend', up, false);
    if (!ignoreNativeClick) {
      el.addEventListener('mousedown', down, false);
      el.addEventListener('mouseup', up, false);
      el.addEventListener('click', click, false);
    }

    // Return a cleanup function
    return function() {
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchend', up);
      if (!ignoreNativeClick) {
        el.removeEventListener('mousedown', down);
        el.removeEventListener('mouseup', up);
        el.removeEventListener('click', click);
      }

      if (dragEventsBound) {
        dragEventsBound = false;
        dragEnder();
      }
    };
  };
})();

},{}],31:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],32:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],33:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":34}],34:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],35:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],36:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":35,"_process":34,"inherits":32}]},{},[7])
//# sourceMappingURL=devel.js.map
