var fs = require('fs')
  , update = React.addons.update
  , FluxibleMixin = require('fluxible').Mixin
  , VirgilFileEntry = require('./virgil-file-entry.jsx')
  , AppActions = require('../actions/app-actions')
  , AppStateStore = require('../stores/app-state-store')
  ;

var VirgilFileList = React.createClass({
  mixins: [FluxibleMixin],

  displayName: 'VirgilFileList',

  statics: {
    storeListeners: {
      onAppStateStoreUpdate: AppStateStore
    }
  },

  getInitialState: function() {
    return this.getStore(AppStateStore).getState();
  },

  onAppStateStoreUpdate: function() {
    this.setState(update(this.state, {$merge: this.getStore(AppStateStore).getState()}));
  },

  render: function() {
    return (
      <div className='file-list'>
        <h1>Source Files</h1>
        {this.state.files.map(function(f) {
          var selected = (this.state.selectedFile == f.name);
          return (
            <VirgilFileEntry onClick={this.handleFileSelect} key={f.name} name={f.name} selected={selected}/>
          );
        }.bind(this))}
      </div>
    );
  },

  handleFileSelect: function(file) {
    this.executeAction(AppActions.openFile, file);
  }
});

module.exports = VirgilFileList;
