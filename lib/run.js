var fs = require('fs')
  , path = require('path')
  , minimist = require('minimist')
  , VizData = require('./viz_data')
  ;

module.exports = function(command, args) {
  if (!command || !module.exports.commands.hasOwnProperty(command)) {
    console.error('Usage: vz <command> [--dir=VIZ LOCATION] <args>');
    console.error('Commands:');
    console.error(Object.keys(module.exports.commands).map(function(k) {
      return '    ' + k + ' - ' + module.exports.commands[k].doc;
    }).join('\n\n'));
    console.error('');
    process.exit(1);
  }

  var commandFn = module.exports.commands[command];
  var commandArgs = minimist(args, commandFn.argParserOpts || {});

  process.chdir(commandArgs.dir || process.cwd());
  delete commandArgs.dir;

  var vizData = new VizData('.');
  vizData.read(function() {
    commandFn(vizData, commandArgs);
  });
};

// Read in contents of commands/ into exports.commands
var commandDir = path.join(__dirname, 'commands');
module.exports.commands = {};
fs.readdirSync(commandDir).forEach(function(f) {
  module.exports.commands[f.split(/\.\w+$/)[0]] = require(path.join(commandDir, f));
});
