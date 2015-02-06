
exports.readFile = function(filepath, options, callback) {
  console.log('fsproxy.readFile(' + filepath + ')');

  if (typeof(options) == 'function') {
    callback = options;
  }

  // proxy request back to the server
  $.ajax({
    url: filepath,
    success: function(data) {
      callback(null, data);
    },
    error: function(xhr, status, err) {
      callback(err);
    }
  });
};

exports.stat = function(filepath, callback) {
  console.log('fsproxy.stat(' + filepath + ')');

  var stats = {
    isFile: function() {
      return true;
    },
    isDirectory: function() {
      return true;
    }
  };

  callback(null, stats);
};
