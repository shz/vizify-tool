module.exports = React.createClass({
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return { playing: false };
  },

  render: function() {
    return (
      <div className="playpause-component" onClick={this.onToggle}>
        {this.state.playing ? '❙❙' : '►'}
      </div>
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
