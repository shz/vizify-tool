var fs = require('fs')
  , virgil = require('virgil')
  , VirgilFileList = require('./virgil-file-list.jsx')
  , FluxibleMixin = require('fluxible').Mixin
  , AppActions = require('../actions/app-actions')
  , AppStateStore = require('../stores/app-state-store')
  ;

var VirgilEditor = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onAppStateStoreUpdate: AppStateStore
    }
  },

  displayName: 'VirgilEditor',

  getInitialState: function() {
    return {
      compilerOutput: 'Ready...'
    };
  },

  onAppStateStoreUpdate: function() {
    var state = this.getStore(AppStateStore).getState();

    // file was just opened so set editor value to its contents
    if (state.fileBody != null && !state.fileDirty) {
      this.codeEditor.setValue(state.fileBody);
    }
    console.log("setting compiler output: " + state.compilerOutput);
    this.setState({compilerOutput: state.compilerOutput});
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

    this.executeAction(AppActions.loadFileList);
  },

  componentWillUnmount: function() {
    window.document.removeEventListener("keydown", this.handleKeyDown);
    this.codeEditor.off('change', this.handleCodeChanged);
  },

  render: function() {
    return (
      <div id="virgil-editor">
        <VirgilFileList/>
        <div id="codemirror" ref="codemirror"/>
        <pre id="virgil-console">
            {this.state.compilerOutput}
        </pre>
        <button className="save" onClick={this.handleSave}>Save</button>
      </div>
    );
  },

  handleCodeChanged: function() {
    console.log("VirgilEditor.handleCodeChanged");
    this.executeAction(AppActions.codeChanged, this.codeEditor.getValue());
  },

  // Ctrl-Enter == compile
  handleKeyDown: function(e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      e.preventDefault();
      this.executeAction(AppActions.compile);
    }
  },

  setCompilerOutput: function(text) {
    var state = this.state;
    state.compilerOutput = text;
    this.setState(state);
  },

  handleSave: function() {
    this.executeAction(AppActions.save);
  },

  handleCompile: function() {
    this.executeAction(AppActions.compile);
  }
});

module.exports = VirgilEditor;
