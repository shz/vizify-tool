var fs = require('fs')
  , virgil = require('virgil')
  , VirgilFileList = require('./virgil-file-list.jsx')
  , formatCompileError = require('../../lib/util/format-compile-error');
  ;

var VirgilEditor = React.createClass({

  getInitialState: function() {
    return {
      files: [],
      selectedFile: null,
      compilerOutput: 'Ready...'
    };
  },

  componentDidMount: function() {

    window.document.addEventListener("keydown", this.handleKeyDown);

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
          <pre id="virgil-console">
            {this.state.compilerOutput}
          </pre>
        <button className="compile" onClick={this.handleCompile}>Compile</button>
      </div>
    );
  },

  // Ctrl-Enter == compile
  handleKeyDown: function(e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      this.handleCompile(e);
    }
  },

  handleLoadFile: function(err, filename, body) {
    this.setState({files: this.state.files, selectedFile: filename});
    this.codeEditor.setValue(body);
  },

  setCompilerOutput: function(text) {
    var state = this.state;
    state.compilerOutput = text;
    this.setState(state);
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
          namespace: 'devenvreload'
        };
        var mainFile = '/src/main.vgl';
        fs.readFile(mainFile, {}, function(err, data) {
          virgil.compileModule(mainFile, data, 'javascript', opts, function(err, result) {
            if (err) {
              this.setCompilerOutput(formatCompileError(err));
              return;
            }
            else {
              this.setCompilerOutput("Success");
            }
            var main = result['main.js'];
            eval(main);
            var compiledResult = window.devenvreload;
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
