var update = React.addons.update
  , fs = require('fs')
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
      compilerOutput: 'Ready...',
      fileDirty: false
    };
  },

  updateState: function(descriptor) {
    this.setState(update(this.state, descriptor));
  },

  onAppStateStoreUpdate: function() {
    var state = this.getStore(AppStateStore).getState();

    // file was just opened so set editor value to its contents
    if (state.fileBody != null && !state.fileDirty) {
      this.fileLoading = true;
      this.codeEditor.setValue(state.fileBody);
    }
    this.updateState({$merge: {
      compilerOutput: state.compilerOutput,
      fileDirty: state.fileDirty
    }});
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
    var cx = React.addons.classSet;
    var classes = cx({
      'save': true,
      'disabled': !this.state.fileDirty
    });

    return (
      <div id="virgil-editor">
        <VirgilFileList/>
        <div id="codemirror" ref="codemirror"/>
        <pre id="virgil-console">
            {this.state.compilerOutput}
        </pre>
        <button className={classes} onClick={this.handleSave}>Save</button>
      </div>
    );
  },

  handleCodeChanged: function() {
    // Don't trigger a change event on first load
    if (!this.fileLoading) {
      this.executeAction(AppActions.codeChanged, this.codeEditor.getValue());
    }
    this.fileLoading = false;
  },

  // Ctrl-Enter == compile
  handleKeyDown: function(e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      e.preventDefault();
      this.executeAction(AppActions.compile);
    }
  },

  handleSave: function() {
    this.executeAction(AppActions.save);
  },

  handleCompile: function() {
    this.executeAction(AppActions.compile);
  }
});

module.exports = VirgilEditor;
