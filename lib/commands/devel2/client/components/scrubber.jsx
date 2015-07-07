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
      <div className="scrubber-component">
        <div className="text">{this.state.ts} / {this.state.duration}</div>
        <div className="inner" style={innerStyle}></div>
      </div>
    );
  },

  componentDidMount: function() {
    this.props.viz.on('frame', this.onFrame);
  },
  componentWillUnmount: function() {
    this.props.viz.removeListener('frame', this.onFrame);
  },
  onFrame: function(ts) {
    this.setState({ ts: ts, duration: this.props.viz.card.duration });
  }
});
