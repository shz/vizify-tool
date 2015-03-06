var CardPlayer = require('./card-player.jsx')
  , FluxibleMixin = require('fluxible').Mixin
  , VirgilEditor = require('./virgil-editor.jsx')
  , Menu = require('./menu.jsx')
  , AppStateStore = require('../stores/app-state-store')
  , AppActions = require('../actions/app-actions')
  ;

var AppComponent = module.exports = React.createClass({
  mixins: [FluxibleMixin],
  displayName: "App",

  statics: {
    storeListeners: {
      onAppStateStoreUpdate: AppStateStore
    }
  },

  getInitialState: function() {
    return { ideEnabled: false };
  },

  onAppStateStoreUpdate: function() {
    this.setState(this.getStore(AppStateStore).getState());
  },

  render: function() {
    var editor = this.state.ideEnabled ? <VirgilEditor/> : undefined;
    console.log(this.props);

    return (
      <div id="app">
        <Menu />
        {editor}
        <CardPlayer {...this.props} ref='player'/>
      </div>
    );
  }
});
