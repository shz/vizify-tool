var vizify = require('vizify-javascript')
  , Bridge = require('../bridge')
  , Player = require('./player')
  , CompileError = require('./compile_error')
  ;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      viz: null,
      error: null,
      data: '{"status": "active"}'
    }
  },

  render: function() {
    var player = null;
    if (this.state.viz) {
      player = <Player viz={this.state.viz} />;
    } else {
      player = <h1>Loading</h1>;
    }

    var error = null;
    if (this.state.error) {
      error = <CompileError details={this.state.error} />;
    }

    return (
      <div className="app-component">
        {player}
        {error}
      </div>
    );
  },

  componentDidMount: function() {
    this.bridge = new Bridge();
    this.bridge.on('compile', this.onCompile);
    this.bridge.on('error', this.onCompileError);
    this.bridge.send('watch');
    this.bridge.send('compile');
  },
  componentWillUnmount: function() {
    this.bridge.close();
    this.bridge = null;
  },

  componentDidUpdate: function() {
    if (this.state.viz) {
      this.reload();
    }
  },

  onGetData: function(data) {
    this.setState({ data: data });
  },
  onCompile: function(data) {
    (function() { eval(data.code) }).call(window);

    if (!this.state.viz) {
      var viz = new vizify.Viz(window.viz.main, 500, 60, 1, this.state.data);
      viz.load(function() {
        this.setState({ viz: viz, error: null });
      }.bind(this));
    } else {
      this.setState({ error: null });
      this.reload();
    }
  },
  onCompileError: function(data) {
    this.setState({ error: data });
  },

  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});
