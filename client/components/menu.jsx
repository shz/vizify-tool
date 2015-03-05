var CardPlayer = require('./card-player.jsx')
  , FluxibleMixin = require('fluxible').Mixin
  , VirgilEditor = require('./virgil-editor.jsx')
  , AppStateStore = require('../stores/app-state-store')
  , AppActions = require('../actions/app-actions')
  ;

var MenuComponent = module.exports = React.createClass({
  mixins: [FluxibleMixin],
  displayName: "Menu",

  statics: {
    storeListeners: {
      onAppStateStoreUpdate: AppStateStore
    }
  },

  getInitialState: function() {
    return this.getStore(AppStateStore).getState();
  },

  onAppStateStoreUpdate: function() {
    this.setState(this.getStore(AppStateStore).getState());
  },

  handleIDEClick: function(e) {
    e.preventDefault();

    this.getStore(AppStateStore).toggleIDE();
  },

  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({'ide-enabled': this.state.ideEnabled});

    return (
      <div id="menu" className={classes}>
        <img src="/dev/vizify.png" alt="Vizify" />
        <a href="#" onClick={this.handleIDEClick}>IDE</a>
        <a href="/production" target="_blank">Production Preview</a>
      </div>
    );
  }
});
