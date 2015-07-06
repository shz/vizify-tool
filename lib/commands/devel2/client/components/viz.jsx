var PlayPause = require('./playpause')
  , Scrubber = require('./scrubber')
  ;

module.exports = React.createClass({
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  render: function() {
    console.log(this.props.viz);


    return (
      <div className="viz-component">
        <div className="container">
          <div ref="holder" />
          <PlayPause viz={this.props.viz} />
          <Scrubber viz={this.props.viz} />
        </div>
      </div>
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
