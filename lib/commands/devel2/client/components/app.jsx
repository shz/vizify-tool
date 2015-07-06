var vizify = require('vizify-javascript')
  , Bridge = require('../bridge')
  , Viz = require('./viz')
  ;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      viz: null,
      data: '{"status": "active"}'
    }
  },

  render: function() {
    if (this.state.viz) {
      return (
        <div className="app-component">
          <Viz viz={this.state.viz} />
        </div>
      );
    } else {
      return (
        <div className="app-component">
          <h1>Loading</h1>
        </div>
      );
    }
  },

  componentDidMount: function() {
    this.bridge = new Bridge();
    this.bridge.on('compile', this.onCompile);
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
        this.setState({ viz: viz });
      }.bind(this));
    } else {
      this.reload();
    }
  },

  reload: function() {
    this.state.viz.reload(window.viz.main, this.state.data);
  }
});
