var CardPlayer = require('./card-player.jsx');
var VirgilEditor = require('./virgil-editor.jsx');

var AppComponent = module.exports = React.createClass({
  displayName: "App",

  handleCompile: function() {
    console.log("app.handleCompile");
    this.refs.player.reloadCard();

    // save the timestamp
    // pause the old card (otherwise it'll still have animation callbacks that keep it alive, running, and un-gc'd),
    // kill the old card
    // and then create a new one with the same canvas
    // i guess you'd want to remember whether the card was playing or not
    // and do a seek and possibly a play/pause on the new one afterward
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