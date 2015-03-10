var update = React.addons.update
  , FluxibleMixin = require('fluxible').Mixin
  , CardPlayerActions = require('../actions/card-player-actions')
  , CardPlayerStateStore = require('../stores/card-player-state-store')
  ;

var ScrubberComponent = module.exports = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onPlayerStateStoreUpdate: CardPlayerStateStore
    }
  },

  displayName: "Scrubber",

  getInitialState: function() {
    var playerState = this.getStore(CardPlayerStateStore).getState();
    return update({}, {$merge: playerState});
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState !== this.state;
  },

  updateState: function(descriptor) {
    this.setState(update(this.state, descriptor));
  },

  componentDidMount: function() {
    window.document.addEventListener("keydown", this.keyDown);
    var self = this;
    this.removeTouchHandlers = window.vz.touch(this.getDOMNode(), {dragDirection: 'horizontal'}, {
      click: function(e) {
        console.log('scrubber click: ' + e.absolute.x, e);
        self.scrub(e.absolute.x);
      },
      drag: function(e) {
        console.log('scrubber drag: ' + e.absolute.x);
        self.scrub(e.absolute.x);
      }
    });
  },

  componentWillUnmount: function() {
    window.document.removeEventListener("keydown", this.keyDown);
    this.removeTouchHandlers();
  },

  render: function() {
    var completionRate = this.state.duration ? (this.state.time / this.state.duration) : 0;
    var scale = 'scale(' + completionRate + ', 1)';
    return (
      <div id="scrubber">
        <span id="timestamp">Timestamp: {this.state.time} / {this.state.duration}</span>
        <div style={{
          transform: scale,
          WebkitTransform: scale,
          MozTransform: scale,
          msTransform: scale
        }}>
        </div>
      </div>
    );
  },

  onPlayerStateStoreUpdate: function() {
    this.updateState({$merge: this.getStore(CardPlayerStateStore).getState()});
  },

  scrub: function(clientX) {
    var scrubberPos = this.scrubberPos();
    var railOriginX = scrubberPos.x;
    var completionRate = Math.max(0, Math.min(1, (clientX - railOriginX) / scrubberPos.w));
    console.log("scrubber scrub: ", railOriginX, completionRate, scrubberPos.w);
    this.executeAction(CardPlayerActions.seek, {completionRate: completionRate});
  },

  scrubberPos: function() {
    var el = this.getDOMNode();
    var rect = el.getBoundingClientRect();
    return {x: rect.left, y: rect.top, w: el.offsetWidth};
  },

  keyDown: function(e) {
    if (e.ctrlKey && e.keyCode === 32) {
      this.executeAction(CardPlayerActions.togglePlayPause);
    }
  }
});
