var CardPlayer = require('./card-player.jsx')
  , VirgilEditor = require('./virgil-editor.jsx')
  , AppStateStore = require('../stores/app-state-store')
  , FluxibleMixin = require('fluxible').Mixin
  ;

var AppComponent = module.exports = React.createClass({
  mixins: [FluxibleMixin],

  displayName: "App",

  statics: {
    storeListeners: {
      onAppStateStoreUpdate: AppStateStore
    }
  },

  onAppStateStoreUpdate: function() {

  },

  handleCompile: function() {
    this.refs.player.reloadCard();
  },

  render: function() {
    return (
      <div>
        <VirgilEditor onCompile={this.handleCompile}/>
        <CardPlayer {...this.props} ref='player'/>
      </div>
    );
  }

});
