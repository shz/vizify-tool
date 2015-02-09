
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

exports.writeFile = function(filepath, data, callback) {
  console.log('fsproxy.writeFile(' + filepath + ')');

  // serve from local cache if possible
  if (!cache[filepath]) {
    alert('file not in cache!');
  }
  cache[filepath] = data;
  return callback(null, data);

  // TODO:
  // now proxy write request back to the server
  $.ajax({
    url: filepath,
    method: 'POST',
    success: function(resp) {
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
