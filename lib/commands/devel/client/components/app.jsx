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
      vizData: null
    }
  },

  render: function() {
    var player = null;
    if (this.canShowPlayer()) {
      var dataSelector = null;
      if (this.state.vizData.hasSampleData) {
        dataSelector = <DataSelector choices={this.state.vizData.sampleData}
                                     onChange={this.requestDataFile} />;
      }

      player = <div>
                 <h1>{this.state.vizData.name} {this.state.vizData.version}</h1>
                 <Player viz={this.state.viz}/>
                 {dataSelector}
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
    this.bridge.on('vizData', this.onUpdateVizData);
    this.bridge.on('dataFile', this.onDataFile);
  },
  componentWillUnmount: function() {
    this.bridge.close();
    this.bridge = null;
  },

  componentDidUpdate: function() {
    if (this.state.vizData && !this.state.viz) {
      var viz = new vizify.Viz(window.viz.main,
        this.state.vizData.size.width,
        this.state.vizData.size.height,
        1,
        this.state.data);

      viz.load(function() {
        this.setState({ viz: viz, error: null });
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
  onUpdateVizData: function(data) {
    data = data.data;

    if (!this.state.data && data.hasSampleData) {
      this.requestDataFile(data.sampleData[0]);
    }
    this.setState({ vizData: data });
  },
  onDataFile: function(data) {
    this.setState({ data: data.data });
  },

  canShowPlayer: function() {
    return this.state.viz &&
           this.state.vizData &&
           (!this.state.vizData.hasSampleData || this.state.data);
  },
  requestDataFile: function(name) {
    this.bridge.send('requestDataFile', {name: name});
  },
  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});
