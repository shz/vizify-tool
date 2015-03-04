var CardPlayer = require('./card-player.jsx')
  , VirgilEditor = require('./virgil-editor.jsx')
  ;

var AppComponent = module.exports = React.createClass({

  displayName: "App",

  render: function() {
    return (
      <div>
        <VirgilEditor/>
        <CardPlayer {...this.props} ref='player'/>
      </div>
    );
  }
});
