var fs = require('fs')
  , virgil = require('virgil')
  , VirgilFileList = require('./virgil-file-list.jsx')
  ;

var VirgilEditor = React.createClass({

  handleCompile: function(e) {
    e.preventDefault();

    console.log('calling fs.readFile', fs);

    fs.readFile('foo', {}, function(err, body) {
      alert(err);
    });

    var src = this.refs.text.getDOMNode().value.trim();
    if (!src) {
      return;
    }

    var options = {};
    try {
      var result = virgil.compile(src, 'javascript', options);

      this.refs.output.getDOMNode().value = result;
    }
    catch(e) {
      this.refs.output.getDOMNode().value = e.toString();
    }
  },

  getInitialState: function() {
    return {data: [
      {name: 'main.vgl'}
    ]};
  },

  componentDidMount: function() {
    $.ajax({
      url: '/src',
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <form className="virgil-editor" onSubmit={this.handleCompile}>
        <VirgilFileList data={this.state.data}/>
        <div>
          <textarea rows="20" cols="80" placeholder="Your Virgil here..." ref="text" />
          <textarea rows="20" cols="80" placeholder="compiler output here..." ref="output" />
        </div>
        <input type="submit" value="Compile" />
      </form>
    );
  }
});

module.exports = VirgilEditor;
