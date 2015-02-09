var fs = require('fs');

var VirgilFileEntry = React.createClass({


  getInitialState: function() {
    return {
      selected: false
    };
  },

  handleClick: function() {
    this.props.onClick(this.props.name);
    this.setState({selected: true});
  },

  render: function() {
    return (
      <label ref="label" onClick={this.handleClick} className='file-entry'>{this.props.name}</label>
    );
  }
});

module.exports = VirgilFileEntry;
