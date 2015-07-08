module.exports = React.createClass({
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
      <div className="scrubber-component" ref="scrubber">
        <div className="text">{this.state.ts.toFixed(0)} / {this.state.duration}</div>
        <div className="inner" style={innerStyle}></div>
      </div>
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
