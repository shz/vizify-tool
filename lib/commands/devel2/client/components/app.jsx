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
      data: '{"status": "active"}',
      cardJSON: null
    }
  },

  render: function() {
    var player = null;
    if (this.state.viz && this.state.cardJSON) {
      player = <div>
                 <h1>{this.state.cardJSON.name}</h1>
                 <Player viz={this.state.viz}/>
               </div>;
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
    this.bridge.on('cardJSON', this.onUpdateCardJSON);
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
      var size = (this.state.cardJSON || {}).size || {};
      var viz = new vizify.Viz(window.viz.main, size.width || 600, size.height || 450, 1, this.state.data);
      viz.load(function() {
        this.setState({ viz: viz, error: null });
        viz.resize(size.width || 600, size.height || 450, 1);
      }.bind(this));
    } else {
      this.setState({ error: null });
      this.reload();
    }
  },
  onCompileError: function(data) {
    this.setState({ error: data });
  },
  onUpdateCardJSON: function(data) {
    data = data.data;

    if (!this.state.cardJSON && this.state.viz) {
      var size = data.size || {};
      this.state.viz.resize(size.width || 600, size.height || 450, 1);
    }
    this.setState({ cardJSON: data });
  },

  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});
