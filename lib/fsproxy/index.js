
var cache = {};

exports.readFile = function(filepath, options, callback) {
  console.log('fsproxy.readFile(' + filepath + ')');

  if (typeof(options) == 'function') {
    callback = options;
  }

  // serve from local cache if possible
  if (cache[filepath]) {
    return callback(null, cache[filepath]);
  }

  // else proxy request back to the server
  $.ajax({
    url: filepath,
    success: function(data) {
      cache[filepath] = data;
      callback(null, data);
    },
    error: function(xhr, status, err) {
      callback(err);
    }
  });
};

exports.writeFile = function(filepath, data, options, callback) {
  console.log('fsproxy.writeFile(' + filepath + ')');

  // serve from local cache if possible
  if (!cache[filepath]) {
    callback(new Error("file " + filepath + " is not in cache!"));
  }
  cache[filepath] = data;

  // proxy write request back to the server, unless this is just a "local" save to the cache
  if (options.localOnly) {
    callback(null);
  } else {
    $.ajax({
      url: filepath,
      method: 'POST',
      data: data,
      success: function(resp) {
        callback(null);
      },
      error: function(xhr, status, err) {
        callback(err);
      }
    });
  }
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
