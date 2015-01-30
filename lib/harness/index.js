var js = require('./js')
  , cpp = require('./cpp')
  , demo = require('./demo')
  ;

exports.create = function(language, options, callback) {
  // TODO - validate options
  if (options.mode == 'demo') {
    return demo.create(options, callback);
  }
  else if (language == 'javascript') {
    return js.create(options, callback);
  }
  else if (language == 'cpp') {
    return cpp.create(options, callback);
  }
  else {
    return callback(new Error('Unknown language ' + language));
  }
};
