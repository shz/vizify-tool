var fs = require('fs');

var VirgilFileEntry = React.createClass({

  handleClick: function() {
    this.props.onClick(this.props.name);
  },

  render: function() {
    return (
      <label onClick={this.handleClick} className='file-entry'>{this.props.name}</label>
    );
  }
});

module.exports = VirgilFileEntry;
