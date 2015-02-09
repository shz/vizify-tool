var fs = require('fs')
  , virgil = require('virgil')
  , VirgilFileList = require('./virgil-file-list.jsx')
  ;

var VirgilEditor = React.createClass({

  getInitialState: function() {
    return {files: [], selectedFile: null};
  },

  componentDidMount: function() {
    // insert codemirror editor
    var parent = this.refs.codemirror.getDOMNode();

    var options = {
      mode: {name: 'javascript', json: false},
      tabSize: 2,
      lineNumbers: true,
      dragDrop: false
    };
    this.codeEditor = CodeMirror(parent, options);

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

  render: function() {
    return (
      <div id="virgil-editor">
        <VirgilFileList onLoadFile={this.handleLoadFile} files={this.state.files}/>
        <div id="codemirror" ref="codemirror"/>
        <button className="compile" onClick={this.handleCompile}>Compile</button>
      </div>
    );
  },

  handleLoadFile: function(err, filename, body) {
    this.setState({files: this.state.files, selectedFile: filename});
    this.codeEditor.setValue(body);
  },

  handleCompile: function(e) {
    e.preventDefault();

    try {
      var rootFilename = '/src/' + this.state.selectedFile;
      var src = this.codeEditor.getValue().trim();
      if (!src) {
        return;
      }

      // save file before compiling
      fs.writeFile(rootFilename, src, function(err, data) {
        // now compile main
        var opts = {
          namespace: 'hello'
        };
        var mainFile = '/src/main.vgl';
        fs.readFile(mainFile, {}, function(err, data) {
          virgil.compileModule(mainFile, data, 'javascript', opts, function(err, result) {
            console.log('compile result: ', err ? err : result);
            var main = result['main.js'];
            eval(main);
            var compiledResult = window.hello;
            console.log(compiledResult);
            this.props.onCompile();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
    catch(e) {
      throw(e);
    }
  }
});

module.exports = VirgilEditor;
