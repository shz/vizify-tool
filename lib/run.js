var fs = require('fs')
  , path = require('path')
  , minimist = require('minimist')
  ;

module.exports = function(command, args) {
  if (!command || !module.exports.commands.hasOwnProperty(command)) {
    console.error('Usage: vz <command> <args>');
    console.error('Commands:');
    console.error('   init    - initialize a new directory as a virgil app.');
    console.error('   devel   - run a development server for the card in the current directory.');
    console.error('   publish - publish the card in the current directory');
    process.exit(1);
  }
  module.exports.commands[command](minimist(args));
};

// Read in contents of commands/ into exports.commands
var commandDir = path.join(__dirname, 'commands');
module.exports.commands = {};
fs.readdirSync(commandDir).forEach(function(f) {
  module.exports.commands[f.split(/\.\w+$/)[0]] = require(path.join(commandDir, f));
});
