var FluxibleMixin = require('fluxible').Mixin;
var CardPlayerActions = require('../actions/card-player-actions');

var ScrubberComponent = module.exports = React.createClass({
  mixins: [FluxibleMixin],

  displayName: "Scrubber",

  componentDidMount: function() {
    // todo: only handle key events when editor is not active.
    // window.document.addEventListener("keydown", this.keyDown);
    var self = this;
    this.removeTouchHandlers = window.vz.touch(this.getDOMNode(), {dragDirection: 'horizontal'}, {
      click: function(e) {
        self.scrub(e.absolute.x);
      },
      drag: function(e) {
        self.scrub(e.absolute.x);
      }
    });

  },

  componentWillUnmount: function() {
    window.document.removeEventListener("keydown", this.keyDown);
    this.removeTouchHandlers();
  },

  render: function() {
    var completionRate = this.props.duration ? (this.props.time / this.props.duration) : 0;
    var scale = 'scale(' + completionRate + ', 1)';
    return (
      <div id="scrubber">
        <span id="timestamp">Timestamp: {this.props.time} / {this.props.duration}</span>
        <div style={{
          transform: scale,
          WebkitTransform: scale,
          MozTransform: scale,
          msTransform: scale
        }}>
        </div>
      </div>
    );
  },

  scrub: function(clientX) {
    var scrubberPos = this.scrubberPos();
    var railOriginX = scrubberPos.x;
    var completionRate = Math.max(0, Math.min(1, (clientX - railOriginX) / scrubberPos.w));
    this.executeAction(CardPlayerActions.seek, completionRate);
  },

  scrubberPos: function() {
    var x = 0;
    var y = 0;
    var rail = el = this.getDOMNode();
    while (el.offsetParent) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }

    return {x: x, y: y, w: rail.offsetWidth};
  },

  keyDown: function(e) {
    if (e.keyCode === 32) {
      this.executeAction(CardPlayerActions.togglePlayPause);
    } else if (e.keyCode === 39) {
      this.executeAction(CardPlayerActions.seekToTime, this.props.time + 16);
    } else if (e.keyCode === 37) {
      this.executeAction(CardPlayerActions.seekToTime, this.props.time - 16);
    }
  }

});
