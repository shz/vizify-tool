module.exports = React.createClass({
  propTypes: {
    choices: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onChange: React.PropTypes.function
  },

  render: function() {
    return (
      <div className="data-selector-component">
        <h2>Data file:</h2>
        <select defaultValue={this.props.choices[0]} onChange={this.onChange}>
          {this.props.choices.map(function(c) {
            return <option value={c}>{c}</option>;
          })}
        </select>
      </div>
    );
  },

  onChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
  }
});
