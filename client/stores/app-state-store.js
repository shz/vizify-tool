var createStore = require('fluxible/utils/createStore');
var AppStateStore = createStore({
  storeName: 'AppStateStore',

  initialize: function() {
    this.appState = {
      fileLoaded: false,
      fileDirty: false
    }
  },

  handlers: {
    AppOpenFile: 'handleOpenFile',
    AppCodeChanged: 'handleCodeChanged',
    AppSave: 'handleSave',
    AppCompile: 'handleCompile',
    AppReloadCard: 'handleReloadCard'
  },

  handleOpenFile: function(name) {
    console.log("AppStateStore.handleOpenFile");
    this.appState.fileLoaded = true;
    this.emitChange();
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
