var fs = require('fs')
  , path = require('path')
  , minimist = require('minimist')
  ;

module.exports = function(command, args) {
  module.exports.commands[command](minimist(args));
};

// Read in contents of commands into exports.commands
var commandDir = path.join(__dirname, 'commands');
module.exports.commands = {};
fs.readdirSync(commandDir).forEach(function(f) {
  module.exports.commands[f.split(/\.\w+$/)[0]] = require(path.join(commandDir, f));
});