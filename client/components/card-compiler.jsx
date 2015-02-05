var virgil = require('virgil');

var CardCompilerComponent = React.createClass({

  displayName: "CardCompiler",

  getInitialState: function() {
    var state = {foo: true};
    return state;
  },

  handleCompile: function() {
    console.log('compiling...');
    var src =
      "function foo {" +
      "let d = 1" +
      "}";

    var options = {};
    var result = virgil.compile(src, 'javascript', options);
    console.log("compilation result: ", result);
  },

  render: function() {
    return (
      <div>
        <h1>Virgil Compiler</h1>
        <button onClick={this.handleCompile}>Compile</button>
      </div>
    );
  }
});

module.exports = CardCompilerComponent;
