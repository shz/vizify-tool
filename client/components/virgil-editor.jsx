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
    this.codeEditor.on('change', this.handleCodeChanged);

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
        <button className="save" onClick={this.handleSave}>Save</button>
      </div>
    );
  },

  handleCodeChanged: function() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(function() {
      console.log('auto compile');
      this.handleCompile();
    }.bind(this), 500);
  },

  // Ctrl-Enter == compile
  handleKeyDown: function(e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      e.preventDefault();
      this.handleCompile();
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

  handleSave: function() {
    this.saveCurrentFile(function(err) {
      if (err) {
        this.setCompilerOutput(err.toString());
      } else {
        this.setCompilerOutput("Saved " + this.state.selectedFile);
      }
    }.bind(this));
  },

  saveCurrentFile: function(options, callback) {
    if (typeof(options) == 'function') {
      callback = options;
      options = {}
    }
    var rootFilename = '/src/' + this.state.selectedFile;
    var data = this.codeEditor.getValue();
    if (data) {
      fs.writeFile(rootFilename, data, options, callback);
    }
  },

  handleCompile: function() {
    // do a "soft" save of the current file so when the Virgil compiler
    // does an fs.readFile on it
    this.saveCurrentFile({localOnly: true}, function(err) {
      if (err) {
        this.setCompilerOutput(err.toString());
        return;
      }
      try {
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
      }
      catch(e) {
        throw(e);
      }
    }.bind(this));
  }
});

module.exports = VirgilEditor;
