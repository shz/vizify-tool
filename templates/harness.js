// Dummy -- need to replace
var querySt = function(name, def) { return def; };


(function() {
  // Helpers
  var ev = function(el, name, f) {
    el.addEventListener(name, f, false);
  };
  var $ = function(id) {
    return document.getElementById(id);
  };

  {{#size}}
    var canvas = window.canvas = new vizify.Canvas({{width}}, {{height}}, 1);
    $('holder').appendChild(canvas.canvas);

    // Sizes the card based on current window size
    var size = function() {
      var cardRatio = {{width}} / {{height}};
      var screenRatio = window.innerWidth / window.innerHeight;

      var scaleFactor = 0;
      if (cardRatio > screenRatio) {
        scaleFactor = window.innerWidth / {{width}};
      } else {
        scaleFactor = window.innerHeight / {{height}};
      }

      canvas.resize({{width}}, {{height}}, scaleFactor);
    };
  {{/size}}

  size();

  // Trigger size() on debounced window size event
  var sizeTimeout = null;
  ev(window, 'resize', function(e) {
    if (sizeTimeout) return;
    sizeTimeout = setTimeout(function() {
      sizeTimeout = null;
      size();
    }, 20);
  });

  // Kick things off by fetching data
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var card = window.card = new vizify.Card(canvas, {{entryPoint}}, xhr.responseText);
        card.load(function() {
          // environment setting: replayable is {{replayable}}
          {{#replayable}}
          card.on('end', function() {
            // Each time the end of the movie is reached, a new
            // Replay button is constructed.  The button element
            // is deleted if the user initiates a Replay, so
            // there is no leak in the case of multiple replays.
            var btn = document.createElement('a');
            btn.href = '#';
            btn.className = 'replay';
            btn.innerHTML = 'Replay';
            $('holder').appendChild(btn);
            document.body.offsetLeft; // reflow
            btn.className = 'replay visible';

            // Responding to a user tap on "Replay":
            var tapHandler = function(e) {
              card.seek(0);
              card.play();
              btn.parentElement.removeChild(btn);
              e.preventDefault();
            };
            ev(btn, 'click', tapHandler);
            ev(btn, 'touchstart', tapHandler);

          });
          {{/replayable}}
          card.play();
        });
      } else {
        // TODO - Error message of some kind
      }
    }
  };
  xhr.open('GET', window.location.hash.replace(/^#/, '') || '{{{dataSource}}}');
  xhr.send();
})();

// When requested, send screenshot
ev(window, 'message', function(e) {
  if (e.data != 'screenshot') return;

  var data = '';
  try {
    window.card.frame(window.card.duration);
    data = window.canvas.canvas.toDataURL();
  } catch (err) {
    setTimeout(function() {
      throw err;
    }, 10);
  }
  // TODO - Probably limit this to cards.yahoo.com
  e.source.postMessage(data, '*');
});
