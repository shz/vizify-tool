var createStore = require('fluxible/utils/createStore')
  , fs = require('fs')
  , virgil = require('virgil')
  , formatCompileError = require('../../lib/util/format-compile-error')
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

  handleCodeChanged: function(body) {
    console.log("AppStateStore.handleCodeChanged");
    this.appState.fileBody = body;
    this.appState.fileDirty = true;

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(function() {
      console.log('appstatestore auto compile');
      this.handleCompile();
    }.bind(this), 500);

    this.emitChange();
  },

  handleSave: function() {
    console.log("AppStateStore.handleSave");
    this.saveCurrentFile(function(err) {
      if (err) {
        this.appState.compilerOutput = err.toString();
      } else {
        this.appState.fileDirty = false;
        this.appState.compilerOutput = "Saved " + this.appState.selectedFile;
      }
      this.emitChange();
    }.bind(this));
  },

  saveCurrentFile: function(options, callback) {
    if (typeof(options) == 'function') {
      callback = options;
      options = {}
    }
    var rootFilename = '/src/' + this.appState.selectedFile;
    var data = this.appState.fileBody;
    if (data) {
      fs.writeFile(rootFilename, data, options, callback);
    }
  },

  handleCompile: function() {
    console.log("AppStateStore.handleCompile");

    // do a "soft" save of the current file so when the Virgil compiler
    // does an fs.readFile on it
    this.saveCurrentFile({localOnly: true}, function(err) {
      if (err) {
        this.appState.compilerOutput = err.toString();
        this.emitChange();
        return;
      }
      try {
        var opts = {
          namespace: 'devenvreload'
        };
        // todo: remove hardcode
        var mainFile = '/src/main.vgl';
        fs.readFile(mainFile, {}, function(err, data) {
          virgil.compileModule(mainFile, data, 'javascript', opts, function(err, result) {
            if (err) {
              this.appState.compilerOutput = formatCompileError(err);
              this.emitChange();
              return;
            }

            eval(result['main.js']);
            this.appState.compilerOutput = "Success";
            this.emitChange();

            // var compiledResult = window.devenvreload;
            // console.log(compiledResult);
            this.executeAction(AppActions.reloadCard);
          }.bind(this));
        }.bind(this));
      }
      catch (e) {
        throw(e);
      }
    }.bind(this));
  },

  handleReloadCard: function() {
    console.log("AppStateStore.handleReloadCard");
    this.emitChange();
  }
});
module.exports = AppStateStore;
