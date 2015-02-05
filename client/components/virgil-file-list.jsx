var VirgilFileEntry = require('./virgil-file-entry.jsx');

var VirgilFileList = React.createClass({

  render: function() {
    var fileNodes = this.props.data.map(function(f) {
      return (
        <VirgilFileEntry name={f.name}/>
      );
    });

    return (
      <div className='file-list'>
        <h1>Source Files</h1>
        {fileNodes}
      </div>
    );
  }
});

module.exports = VirgilFileList;
