var fs = require('fs')
  , VirgilFileEntry = require('./virgil-file-entry.jsx');

var VirgilFileList = React.createClass({

  handleFileSelect: function(file) {
    fs.readFile('/src/' + file, function(err, body) {
      this.props.onLoadFile(err, file, body);
    }.bind(this));
  },

  render: function() {
    console.log('handler: ', this.handleFileSelect);
    var fileNodes = this.props.data.map(function(f) {
      return (
        <VirgilFileEntry onClick={this.handleFileSelect} name={f.name}/>
      );
    }.bind(this));

    return (
      <div className='file-list'>
        <h1>Source Files</h1>
        {fileNodes}
      </div>
    );
  }
});

module.exports = VirgilFileList;
