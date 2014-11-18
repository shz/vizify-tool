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
  window.addEventListener('resize', size, false);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var card = window.card = new vizify.Card(canvas, {{entryPoint}}, xhr.responseText);
      } else {
        // TODO - Error message of some kind
      }
    }
  };
  xhr.open('GET', '{{{dataSource}}}' || window.location.hash.replace(/^#/, ''));
  xhr.send();
})();
