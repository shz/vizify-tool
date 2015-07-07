var PlayPause = require('./playpause')
  , Scrubber = require('./scrubber')
  , Viz = require('./viz')
  ;

module.exports = React.createClass({
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      width: 600,
      height: 450,
      diffWidth: 0,
      diffHeight: 0,
      diffEnabled: false
    };
  },

  render: function() {
    var size = {
      width: this.state.width,
      height: this.state.height
    };
    var diffStyle = {
      display: 'none'
    };
    if (this.state.diffEnabled) {
      diffStyle.width = this.state.diffWidth + this.state.width;
      diffStyle.height = this.state.diffHeight + this.state.height;
      diffStyle.marginLeft = (this.state.diffWidth / -2).toFixed(0);
      diffStyle.marginTop = (this.state.diffHeight / -2).toFixed(0);
      diffStyle.display = 'block'
    }

    return (
      <div className="player-component" style={{width: this.state.width}}>
        <div className="size-diff" style={diffStyle}>
          <div className="width">{diffStyle.width}px</div>
          <div className="height">{diffStyle.height}px</div>
        </div>
        <div className="sized" style={size}>
          <Viz viz={this.props.viz} />
          <div className="dragger" ref="dragger" />
        </div>
        <PlayPause viz={this.props.viz} />
        <Scrubber viz={this.props.viz} />
      </div>
    );
  },

  componentDidMount: function() {
    this.touchKiller = vz.touch(this.refs.dragger.getDOMNode(), {
      drag: function(e) {
        if (e.dragState === 0) {
          this.setState({ diffEnabled: true });
        } else if (e.dragState === 1) {
          this.setState({
            diffWidth: e.relative.x,
            diffHeight: e.relative.y,
            diffEnabled: true,
          });
        } else if (e.dragState === 2) {
          var newWidth = this.state.width + this.state.diffWidth;
          var newHeight = this.state.height + this.state.diffHeight;

          this.setState({
            width: newWidth,
            height: newHeight,
            diffWidth: 0,
            diffHeight: 0,
            diffEnabled: false
          });

          this.props.viz.resize(newWidth, newHeight, 1);
          this.props.viz.frame(this.props.viz.getTime());
        }
      }.bind(this)
    });
  },
  componentWillUnmount: function() {
    this.touchKiller();
    delete this.touchKiller();
  }
});
