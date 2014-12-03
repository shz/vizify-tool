// Dummy -- need to replace
var querySt = function(name, def) { return def; };


(function() {
  var canvas = window.canvas = new vizify.Canvas({{width}}, {{height}}, 1);
  document.body.appendChild(canvas.canvas);

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

  size();

  // Trigger size() on debounced window size event
  var sizeTimeout = null;
  window.addEventListener('resize', function(e) {
    if (sizeTimeout) return;
    sizeTimeout = setTimeout(function() {
      sizeTimeout = null;
      size();
    }, 20);
  }, false);

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
            var elemCanv = card.canvas.canvas;
            var btn = document.createElement('div');
            btn.setAttribute('class', 'button-replay');
            btn.appendChild(document.createTextNode('Replay'));
            var btnParent = elemCanv.parentElement;
            btnParent.appendChild(btn);

            // Responding to a user tap on "Replay":
            var tapHandler = function(e) {
              card.seek(0);
              card.play();
              btnParent.removeChild(btn);
              e.preventDefault();
            };
            btn.addEventListener('click', tapHandler);
            btn.addEventListener('touchstart', tapHandler);
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
window.addEventListener('message', function(e) {
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
  console.log('posting back', data.length);
  e.source.postMessage(data, '*');
}, false);
