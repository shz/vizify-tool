var fs = require('fs');

var VirgilFileEntry = React.createClass({

  displayName: 'VirgilFileEntry',

  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'file-entry': true,
      'selected': this.props.selected
    });

    return (
      <label ref="label" onClick={this.handleClick} className={classes}>{this.props.name}</label>
    );
  },

  handleClick: function() {
    this.props.onClick(this.props.name);
  }
});

module.exports = VirgilFileEntry;
