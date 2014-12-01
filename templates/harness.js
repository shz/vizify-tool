// Dummy -- need to replace
var querySt = function(name, def) { return def; };


(function() {
  var canvas = window.canvas = new vizify.Canvas({{width}}, {{height}}, 1);
  document.body.appendChild(canvas.canvas);

  // Patrick will edit this to obtain settings.
  var settings = {
    replayable: true,
    startWithFrameNumber: 8300  // Useful during devel.  Default: null
  };

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
          if (settings.replayable) {
            card.on('end', function() {
              // Each time the end of the movie is reached, a new
              // Replay button is constructed.  The button element
              // is deleted if the user initiates a Replay, so
              // there is no leak in the case of multiple replays.
              console.log("Handling the movie END event...");
              var elemCanv = card.canvas.canvas;
              var btn = document.createElement('div');
              btn.setAttribute('class', 'button-replay');
              btn.appendChild(document.createTextNode("Replay"));
              var btnParent = elemCanv.parentElement;
              btnParent.appendChild(btn);
              btn.addEventListener('click', function() {
                // Handle user click on the Replay button.
                console.log("Handling user click on REPLAY button...");
                card.seek(0);
                card.play();
                btnParent.removeChild(btn);
              });
            });
          }
          if (settings.startWithFrameNumber) {
            console.log("Jumping to frame " + settings.startWithFrameNumber + " before starting...");
            card.seek(settings.startWithFrameNumber);
          }
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
