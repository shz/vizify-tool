var fs = require('fs')
  , virgil = require('virgil')
  , VirgilFileList = require('./virgil-file-list.jsx')
  ;

var VirgilEditor = React.createClass({

  handleCompile: function(e) {
    e.preventDefault();

    try {
      var rootFilename = '/src/' + this.state.selectedFile;
      var src = this.refs.text.getDOMNode().value.trim();
      if (!src) {
        return;
      }

      var opts = {
        namespace: 'hello'
        // libs: util.parseLibs(options.libs),
        // namespace: options.name.camelize(false),
        // browserify: !!options.browserify
      };


      virgil.compileModule(rootFilename, src, 'javascript', opts, function(err, result) {
        console.log('compile result: ', err ? err : result);
        var main = result['main.js'];
        window.hello = null;
        eval(main);
        var compiledResult = window.hello;
        console.log(compiledResult);
        this.props.onCompile();
      }.bind(this));
    }
    catch(e) {
      throw(e);
    }
  },

  getInitialState: function() {
    return {files: [], selectedFile: null, selectedFileBody: null};
  },

  componentDidMount: function() {
    $.ajax({
      url: '/src',
      dataType: 'json',
      success: function(data) {
        this.setState({files: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleLoadFile: function(err, filename, body) {
    this.setState({files: this.state.files, selectedFile: filename});
    this.refs.text.getDOMNode().value = body;
  },

  render: function() {
    return (
      <form className="virgil-editor" onSubmit={this.handleCompile}>
        <VirgilFileList onLoadFile={this.handleLoadFile} data={this.state.files}/>
        <div>
          <textarea rows="20" cols="80" placeholder="Your Virgil here..." ref="text" />
        </div>
        <input type="submit" value="Compile" />
      </form>
    );
  }
});

module.exports = VirgilEditor;
