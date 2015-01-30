var CardPlayer = require('./card-player.jsx');

var AppComponent = module.exports = React.createClass({
  displayName: "App",

  render: function() {
    return (
      <div>
        <CardPlayer {...this.props} />
        <p className="datasource">
          Datasource: <a target="_blank" href={this.props.dataSource}>{this.props.dataSource}</a>
        </p>
        <p>
          <a href="/production">Production preview</a>
        </p>
      </div>
    );
  }

});
