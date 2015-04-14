//
// This file is as terse as possible to get the size down.  Sorry if
// it's a little wonky to read.
//

// DRY
w = this;
d = document;
v = 0; // the viz
r = 0; // ready flag

// Launch gate
function go() {
  r ? r() : (r = 1)
}

// Calculate size
function s() {
  var cardRatio = {{size.width}} / {{size.height}};
  var screenRatio = w.innerWidth / w.innerHeight;

  var scaleFactor = 0;
  if (cardRatio > screenRatio) {
    scaleFactor = w.innerWidth / {{size.width}};
  } else {
    scaleFactor = w.innerHeight / {{size.height}};
  }

  return scaleFactor;
}

// Fetch data
x = new XMLHttpRequest();
x.onreadystatechange = function() {
  if (x.readyState == 4 && x.status == 200) {
    var t = x.responseText;
    r ? h(t) : (r = h.bind(0, t));
  }
};
x.open('GET', w.location.hash.replace(/^#/, '') || '{{{dataSource}}}');
x.send();

// Handle data and launch the viz itself
function h(data) {
  // Launch the viz
  v = new vizify.Viz({{entryPoint}}, {{size.width}}, {{size.height}}, s(), data);
  v.load(function() {
    v.play();
  });

  // Helpers
  function ev(el, name, f) {
    el.addEventListener(name, f, false);
  };

  // Add viz to DOM
  d.body.appendChild(v.element);

  // Debounce window resize to trigger viz resize
  var sizeTimeout = null;
  ev(w, 'resize', function(e) {
    if (sizeTimeout) return;
    sizeTimeout = setTimeout(function() {
      sizeTimeout = 0;
      v.resize({{size.width}}, {{size.height}}, s());
      v.frame(v.getTime());
    }, 20);
  });

  // When requested, send screenshot
  ev(w, 'message', function(e) {
    if (e.data != 'screenshot') return;

    var data = '';
    try {
      v.frame(v.duration);
      data = v.canvas.canvas.toDataURL();
    } catch (err) {
      setTimeout(function() {
        throw err;
      }, 10);
    }
    // TODO - Probably limit this to cards.yahoo.com
    e.source.postMessage(data, '*');
  });

  // Show replay button if enabled
  {{#replayable}}
  v.on('end', function() {
    var btn = d.createElement('a');
    btn.href = '#';
    btn.className = 'replay';
    btn.innerHTML = 'Replay';
    v.element.appendChild(btn);
    d.body.offsetLeft; // reflow
    btn.className = 'replay visible';

    // Responding to a user tap on "Replay":
    var tapHandler = function(e) {
      v.seek(0);
      v.play();
      v.element.removeChild(btn);
      e.preventDefault();
    };
    ev(btn, 'click', tapHandler);
    ev(btn, 'touchstart', tapHandler);

  });
  {{/replayable}}
}

