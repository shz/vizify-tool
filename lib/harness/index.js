var js = require('./js')
  , cpp = require('./cpp')
  ;

exports.create = function(language, options, callback) {
  // TODO - validate options

  if (language == 'javascript')
    return js.create(options, callback);
  else if (language == 'cpp')
    return cpp.create(options, callback);
  else
    return callback(new Error('Unknown language ' + language));
};
