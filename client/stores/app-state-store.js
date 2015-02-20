var createStore = require('fluxible/utils/createStore')
  , fs = require('fs')
  ;


var AppStateStore = createStore({
  storeName: 'AppStateStore',

  initialize: function() {
    this.appState = {
      files: [],
      fileBody: null,
      fileDirty: false,
      selectedFile: null,
      compilerOutput: 'Ready...'
    };
  },

  handlers: {
    AppLoadFileList: 'handleLoadFileList',
    AppOpenFile: 'handleOpenFile',
    AppCodeChanged: 'handleCodeChanged',
    AppSave: 'handleSave',
    AppCompile: 'handleCompile',
    AppReloadCard: 'handleReloadCard'
  },

  getState: function() {
    return this.appState;
  },

  handleLoadFileList: function() {
    $.ajax({
      url: '/src',
      dataType: 'json',
      success: function(data) {
        this.appState.files = data;
        this.emitChange();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  handleOpenFile: function(name) {
    console.log("AppStateStore.handleOpenFile");
    this.appState.selectedFile = name;

    // TODO: remove hardcoded /src/
    fs.readFile('/src/' + name, function(err, body) {
      // TODO: handle err
      this.appState.fileBody = body;
      this.emitChange();
    }.bind(this));
  },

  handleCodeChanged: function() {
    console.log("AppStateStore.handleCodeChanged");
    this.appState.fileDirty = true;
    this.emitChange();
  },

  handleSave: function() {
    console.log("AppStateStore.handleSave");
    this.appState.fileDirty = false;
    this.emitChange();
  },

  handleCompile: function() {
    console.log("AppStateStore.handleCompile");
    this.emitChange();
  },

  handleReloadCard: function() {
    console.log("AppStateStore.handleReloadCard");
    this.emitChange();
  }
});
module.exports = AppStateStore;
