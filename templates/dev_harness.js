// Dummy -- need to replace
var querySt = function(name, def) { return def; };

(function() {
  var queryString = {};
  window.location.search.substr(1).split('&').map(function(s) {
    return s.split('=').map(decodeURIComponent);
  }).forEach(function(a) {
    queryString[a[0]] = a[1];
  });

  var query = function(name, def) {
    return queryString[name] || def;
  };

  // Current canvas scale
  var scale = 1;

  // Prep canvas
  var canvas = window.canvas = new vizify.Canvas({{width}}, {{height}}, 1);
  canvas.resize({{width}}, {{height}}, scale);

  var loadCardData = function(data) {
    var card = window.card = new vizify.Card(canvas, {{entryPoint}}, data);

    // Load card assets and play
    card.load(function() {
      card.seek(parseInt(query('t', 0), 10));
      card.play();
      var holder = document.getElementById('holder');
      holder.insertBefore(canvas.canvas, holder.childNodes[0]);
    });

    // Wire up scrubber updates
    card.on('frame', function(t) {
      updateTimestamp();

      var s = scrubber.childNodes[0].style;
      s.transform =
        s.WebkitTransform =
          s.MozTransform =
            s.msTransform = 'scale(' + (t / card.duration) + ', 1)';
    });
  };

  // Now decide whether to get data from the remote datasource or a local file
  var datafile = query('datafile', 'none');
  if (datafile != 'none') {
    var data = localStorage['vz.datafiles.' + datafile];
    loadCardData(data);
  }
  else {
    // Kick things off by fetching data
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          loadCardData(xhr.responseText);
        } else {
          var error = document.createElement('pre');
          error.className = 'error';
          error.appendChild(document.createTextNode(xhr.responseText || 'Network Error'));
          document.body.appendChild(error);
        }
      }
    };
    xhr.open('GET', '{{{dataSource}}}');
    xhr.send();
  }

  // Wire up scrubber
  var scrubberPos = function() {
    var x = 0;
    var y = 0;
    var el = scrubber;
    while (el.offsetParent) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }

    return (scrubBase = { x: x, y: y, w: scrubber.offsetWidth });
  };
  var scrubber = document.getElementById('scrubber');
  var scrubBase = { x: 0, y: 0, w: 0 };
  vz.touch(scrubber, {dragDirection: 'horizontal'}, {
    click: function(e) {
      handleScrub(e.absolute.x - scrubberPos().x);
    },
    drag: function(e) {
      if (e.dragState === 0) {
        scrubberPos();
      }

      handleScrub(e.absolute.x - scrubBase.x);
    }
  });

  var handleScrub = function(x) {
    var p = x / scrubBase.w;
    p = Math.max(0, p);
    p = Math.min(1, p);
    var t = (card.duration * p)|0;
    var resume = card.status == 'playing';
    if (resume)
      card.pause();
    card.seek(t);
    if (resume)
      card.play();
    else
      card.frame(t);

    var s = scrubber.childNodes[0].style;
    s.transform =
    s.WebkitTransform =
    s.MozTransform =
    s.msTransform = 'scale(' + p + ', 1)';
  };

  var timestampTo = null;
  var updateTimestamp = function() {
    if (timestampTo !== null) return;
    timestampTo = setTimeout(function() {
      timestampTo = null;

      var playpause = document.getElementById('playpause');
      var t = 0;
      if (card.status == 'playing') {
        t = Date.now() - card._start + card._offset;
        playpause.innerHTML = "Pause";
      } else {
        t = card._offset;
        playpause.innerHTML = "Play";
      }
      document.getElementById('timestamp').value = t;
    }, 50);
  };

  var handlePlayPause = function() {
    var btn = document.getElementById('playpause');
    if (card.status == 'playing') {
      card.pause();
      btn.innerHTML = "Play";
    }
    else {
      card.play();
      btn.innerHTML = "Pause";
    }
  };

  var getDataFileNames = function() {
    return localStorage['vz.datafiles'] ? localStorage['vz.datafiles'].split('|') : [];
  };

  // populate files in local storage
  var listDataFiles = function(selectedFile) {

    var datafile = selectedFile ? selectedFile : query('datafile', 'none');
    var select = document.getElementById('datafile');

    // remove existing children
    var children = select.childNodes;
    var len = children.length;
    for (var i = 0; i < len; i++) {
      // children is a 'live' list which shrinks each time we removeChild
      select.removeChild(children[0]);
    }

    var addOption = function(name, selected) {
      var item = document.createElement('option');
      if (selected) {
        item.setAttribute('selected', true);
      }
      item.setAttribute('value', name);
      item.appendChild(document.createTextNode(name));
      select.appendChild(item);
    };

    // populate list with every data file

    addOption('none', datafile === 'none');
    var filenames = getDataFileNames();
    filenames.forEach(function(f) {
      addOption(f, datafile === f);
    });
  };

  var addFileToLocalStorage = function(file, data) {
    var filenames = getDataFileNames();
    var found = false;
    filenames.forEach(function(f) {
      if (f === file.name) {
        found = true;
      }
    });
    // only add this file to the list if it's not there already
    if (!found) {
      filenames.push(file.name);
    }
    localStorage['vz.datafiles'] = filenames.join('|');
    localStorage['vz.datafiles.' + file.name] = data;
    listDataFiles();
  };

  var clearDataFiles = function() {
    var filenames = getDataFileNames();
    filenames.forEach(function(file) {
      delete localStorage['vz.datafiles.' + file];
    });
    delete localStorage['vz.datafiles'];
    listDataFiles('none');
    alert("Local data files have been cleared.");
    document.forms[0].submit();
  };

  // Load local data file into local storage
  var handleFileSelect = function(evt) {
    var file = evt.target.files[0]; // FileList object

    if (file.type.indexOf('text') === -1 && file.type.indexOf('json') === -1) {
      alert('Sorry, you can only load text files');
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      addFileToLocalStorage(file, reader.result);
      listDataFiles(file.name);
      document.forms[0].submit();
    };
    reader.readAsText(file);
  };

  listDataFiles();
  document.getElementById('playpause').addEventListener('click', handlePlayPause, false);
  document.getElementById('filechooser').addEventListener('change', handleFileSelect, false);
  document.getElementById('datafile').addEventListener('change', function() {
    document.forms[0].submit();
  }, false);
  document.getElementById('clear-files').addEventListener('click', clearDataFiles, false);

})();
