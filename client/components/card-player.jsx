var update = React.addons.update;

var Vizify = window.vizify.react.VizifyComponent;
var Scrubber = require('./scrubber.jsx');

var CardPlayerActions = require('../actions/card-player-actions');
var CardPlayerStateStore = require('../stores/card-player-state-store');

var CardPlayerComponent = module.exports = React.createClass({
  displayName: "CardPlayer",

  getInitialState: function() {
    var playerState = CardPlayerStateStore.playerState;
    var state = update({}, {$merge: playerState});

    var testDataFiles = this.props.testDataFiles;
    for (var dataFile in testDataFiles) {
      if (testDataFiles.hasOwnProperty(dataFile)) {
        if (testDataFiles[dataFile].selected) {
          state.dataFile = testDataFiles[dataFile].name;
          break;
        }
      }
    }

    return state;
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState !== this.state;
  },

  updateState: function(descriptor) {
    this.setState(update(this.state, descriptor));
  },

  componentWillMount: function() {
    if (this.props.entryPoint) {
      var split = this.props.entryPoint.split('.');
      this.cardFn = window[split[0]][split[1]];
    }
  },

  componentDidMount: function() {
    CardPlayerStateStore.addChangeListener(this.onPlayerStateChanged);

    // This is when we get our reference to the card object.
    var card = this.refs.vizify.card;
    this.syncWithCard();

    // Is this cheating?
    CardPlayerStateStore.playerState.duration = card.duration;
  },

  componentWillUnmount: function() {
    CardPlayerStateStore.removeChangeListener(this.onPlayerStateChanged);
  },

  componentDidUpdate: function(prevProps, prevState) {
    var card = this.refs.vizify.card;

    if (prevState.time !== this.state.time) {
      if (this.state.isPaused) {
        card.seek(this.state.time);
        card.frame(this.state.time);
      }
    }

    if (this.state.isPaused !== prevState.isPaused) {
      if (this.state.isPaused) {
        card.pause();
      } else {
        card.seek(this.state.time);
        card.play();
        this.syncWithCard();
      }
    }
  },

  syncWithCard: function() {
    var card = this.refs.vizify.card;
    var sync = (function() {
      if (this.state.isPaused) {
        return;
      }
      CardPlayerActions.updateFrame(card.getTime());
      requestAnimationFrame(sync);
    }).bind(this);
    requestAnimationFrame(sync);
  },

  render: function() {
    var card;
    if (this.cardFn && this.props.cardData) {
      card = <Vizify ref="vizify" {...this.props} card={this.cardFn} data={this.props.cardData} autoplay={!this.state.isPaused}/>;
    }

    return (
      <div>
        <div id="cardcontainer" style={{width: this.props.width, height: this.props.height}}>
          {card}
        </div>
        <form id="holder">
          <Scrubber duration={this.state.duration} time={this.state.time} />
          <button id="playpause" onClick={this.togglePause}>
            {this.state.isEnded ? "Replay" :
              (this.state.isPaused ? "Play" : "Pause")}
          </button>

          Current timestamp: {this.state.time} / {this.state.duration}
          <input type="hidden" name="t" value={this.state.time} readOnly />

          <div id="uselocalfile">
            <label id="uselocalfile">Test Data File:
              <select name="datafile" id="datafile" value={this.state.dataFile} onChange={this.onDataFileChange}>
                <option value="none">None</option>
                {this.props.testDataFiles.map(function(file) {
                  return <option value={file.name}>{file.name}</option>
                })}
              </select>
            </label>
          </div>

          <p></p>

          <input type="submit" value="Save" />
        </form>
      </div>
    );
  },

  onPlayerStateChanged: function() {
    this.updateState({$merge: CardPlayerStateStore.playerState});
  },

  onDataFileChange: function(e) {
    this.updateState({
      dataFile: {$set: e.target.value}
    });
  },

  togglePause: function(e) {
    e.stopPropagation();
    e.preventDefault();
    CardPlayerActions.togglePlayPause();
  }

});
