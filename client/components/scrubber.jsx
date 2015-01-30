var CardPlayerActions = require('../actions/card-player-actions');

var ScrubberComponent = module.exports = React.createClass({

  displayName: "Scrubber",

  componentDidMount: function() {
    document.addEventListener("mouseup", this.mouseUp);
    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("keydown", this.keyDown);
  },

  componentWillUnmount: function() {
    document.removeEventListener("mouseup", this.mouseUp);
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("keydown", this.keyDown);
  },

  render: function() {
    var completionRate = this.props.duration ? (this.props.time / this.props.duration) : 0;
    var scale = 'scale(' + completionRate + ', 1)';
    return (
      <div id="scrubber" onMouseDown={this.mouseDown}>
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
    CardPlayerActions.seek(completionRate);
  },

  mouseDown: function(e) {
    this.scrub(e.clientX);
    document.body.classList.add("unselectable");
    this.drag = {
      startX: e.clientX
    };
  },

  mouseUp: function(e) {
    if (!this.drag) {
      return;
    }
    this.drag = null;
    document.body.classList.remove("unselectable");
  },

  mouseMove: function(e) {
    if (!this.drag) {
      return;
    }
    this.scrub(e.clientX);
  },

  keyDown: function(e) {
    if (e.keyCode === 32) {
      CardPlayerActions.togglePlayPause();
    } else if (e.keyCode === 39) {
      CardPlayerActions.seekToTime(this.props.time + 16);
    } else if (e.keyCode === 37) {
      CardPlayerActions.seekToTime(this.props.time - 16);
    }
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
  }

});
