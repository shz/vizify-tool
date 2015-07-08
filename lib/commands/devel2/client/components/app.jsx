var vizify = require('vizify-javascript')
  , Bridge = require('../bridge')
  , Player = require('./player')
  , CompileError = require('./compile_error')
  , DataSelector = require('./data_selector')
  ;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      viz: null,
      error: null,
      data: null,
      cardJSON: null
    }
  },

  render: function() {
    var player = null;
    if (this.state.viz && this.state.cardJSON && this.state.data) {
      player = <div>
                 <h1>{this.state.cardJSON.name}</h1>
                 <Player viz={this.state.viz}/>
                 <DataSelector choices={['active.json', 'landed.json']} onChange={this.requestDataFile} />
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
    this.bridge.on('dataFile', this.onDataFile);
  },
  componentWillUnmount: function() {
    this.bridge.close();
    this.bridge = null;
  },

  componentDidUpdate: function() {
    if (this.state.data && this.state.cardJSON && !this.state.viz) {
      var size = (this.state.cardJSON || {}).size || {};
      var viz = new vizify.Viz(window.viz.main, size.width || 600, size.height || 450, 1, this.state.data);
      viz.load(function() {
        this.setState({ viz: viz, error: null });
        viz.resize(size.width || 600, size.height || 450, 1);
        viz.play();
      }.bind(this));

      this.setState({ viz: viz });
    } else if (this.state.viz) {
      this.reload();
    }
  },

  onGetData: function(data) {
    this.setState({ data: data });
  },
  onCompile: function(data) {
    (function() { eval(data.code) }).call(window);
    this.setState({ error: null });
  },
  onCompileError: function(data) {
    this.setState({ error: data });
  },
  onUpdateCardJSON: function(data) {
    data = data.data;

    if (!this.state.data) {
      this.requestDataFile('active.json');
    }
    this.setState({ cardJSON: data });
  },
  onDataFile: function(data) {
    this.setState({ data: data.data });
  },

  requestDataFile: function(name) {
    this.bridge.send('requestDataFile', {name: name});
  },
  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});
