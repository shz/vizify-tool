var CardPlayer = require('./card-player.jsx');
var VirgilEditor = require('./virgil-editor.jsx');

var AppComponent = module.exports = React.createClass({
  displayName: "App",

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