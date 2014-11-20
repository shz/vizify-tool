// Dummy -- need to replace
var querySt = function(name, def) { return def; };

(function() {
  var canvas = window.canvas = new vizify.Canvas({{width}}, {{height}}, 1);
  document.body.appendChild(canvas.canvas);


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

  var sizeTimeout = null;
  window.addEventListener('resize', function(e) {
    if (sizeTimeout) return;
    sizeTimeout = setTimeout(function() {
      sizeTimeout = null;
      size();
    }, 20);
  }, false);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var card = window.card = new vizify.Card(canvas, {{entryPoint}}, xhr.responseText);
        card.play();
      } else {
        // TODO - Error message of some kind
      }
    }
  };
  xhr.open('GET', '{{{dataSource}}}' || window.location.hash.replace(/^#/, ''));
  xhr.send();
})();
