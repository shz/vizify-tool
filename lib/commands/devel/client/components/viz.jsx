module.exports = React.createClass({
  propTypes: {
    viz: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="viz-component">
        <div ref="holder" className="container"></div>
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
