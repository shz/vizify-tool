var fs = require('fs');

var VirgilFileEntry = React.createClass({

  handleClick: function(e) {
    alert('file click: ' + e.target.innerHTML);
  },

  render: function() {
    return (
      <label onClick={this.handleClick} className='file-entry'>{this.props.name}</label>
    );
  }
});

module.exports = VirgilFileEntry;
