var fs = require('fs')
  , VirgilFileEntry = require('./virgil-file-entry.jsx');

var VirgilFileList = React.createClass({

  displayName: 'VirgilFileList',

  getInitialState: function() {
    return {
      selectedFile: ''
    };
  },

  render: function() {
    console.log('selected: ' + this.state.selectedFile);
    return (
      <div className='file-list'>
        <h1>Source Files</h1>
        {this.props.files.map(function(f) {
          var selected = (this.state.selectedFile == f.name);
          return (
            <VirgilFileEntry onClick={this.handleFileSelect} key={f.name} name={f.name} selected={selected}/>
          );
        }.bind(this))}
      </div>
    );
  },

  handleFileSelect: function(file) {
    this.setState({selectedFile: file});
    fs.readFile('/src/' + file, function(err, body) {
      this.props.onLoadFile(err, file, body);
    }.bind(this));
  }
});

module.exports = VirgilFileList;
