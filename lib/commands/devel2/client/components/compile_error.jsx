module.exports = React.createClass({
  propTypes: {
    details: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="compile-error-component">
        <div className="filename">Error in {this.props.details.filename}:</div>
        <div className="gutter">
          {this.props.details.gutter.map(function(s) {
            return <pre>{s}</pre>;
          })}
        </div>
        <div className="context">
          {this.props.details.highlighted.map(function(s) {
            return <pre dangerouslySetInnerHTML={{__html: s || '&nbsp;'}} />
          })}
        </div>
        <div className="message">{this.props.details.message}</div>
      </div>
    );
  }
});
