var update = React.addons.update
  , FluxibleMixin = require('fluxible').Mixin
  , Vizify = window.vizify.react.VizifyComponent
  , Scrubber = require('./scrubber.jsx')
  , CardPlayerActions = require('../actions/card-player-actions')
  , CardPlayerStateStore = require('../stores/card-player-state-store')
  , AppStateStore = require('../stores/app-state-store')
  ;

var CardPlayerComponent = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onPlayerStateStoreUpdate: CardPlayerStateStore,
      onAppStateStoreUpdate: AppStateStore
    }
  },

  displayName: "CardPlayer",

  getInitialState: function() {
    var playerState = this.getStore(CardPlayerStateStore).getState();
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

  onPlayerStateStoreUpdate: function() {
    this.updateState({$merge: this.getStore(CardPlayerStateStore).getState()});
  },

  onAppStateStoreUpdate: function() {
    this.updateState({$merge: this.getStore(CardPlayerStateStore).getState()});

    // if we need to reload then do it
    var appState = this.getStore(AppStateStore).getState();
    if (appState.reloadCard) {
      this.cardFn = window.devenvreload.main;
      this.refs.vizify.card.reload(this.cardFn, this.props.cardData);

      // duration may have changed so must update it.
      this.executeAction(CardPlayerActions.reloadCard, {duration: this.refs.vizify.card.duration});
    }
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
    // This is when we get our reference to the card object.
    var card = this.refs.vizify.card;
    this.syncWithCard();

    // Is this cheating?
    this.getStore(CardPlayerStateStore).playerState.duration = card.duration;
  },

  componentDidUpdate: function(prevProps, prevState) {
    var card = this.refs.vizify.card;

    if (this.state.isPaused) {
      card.pause();
      card.seek(this.state.time);
      card.frame(this.state.time);
    } else if (this.state.isPaused !== prevState.isPaused) {
      card.seek(this.state.time);
      card.play();
      this.syncWithCard();
    }
  },

  // Called after card is compiled
  reloadCard: function() {
  },

  syncWithCard: function() {
    var card = this.refs.vizify.card;
    var sync = (function() {
      if (this.state.isPaused) {
        return;
      }
      this.executeAction(CardPlayerActions.updateFrame, {t: card.getTime()});
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
      <div id="card-player">
        <div id="card-container" style={{width: this.props.width, height: this.props.height}}>
          {card}
        </div>
        <form id="card-controls">
          <Scrubber duration={this.state.duration} time={this.state.time} />
          <button id="playpause" onClick={this.togglePause}>
            {this.state.isEnded ? "Replay" :
              (this.state.isPaused ? "Play" : "Pause")}
          </button>
          <input id="savetimestamp" type="submit" value="Save Timestamp" />

          <input type="hidden" name="t" value={this.state.time} readOnly />

          <div id="usedatafile">
            <label>Test Data File:
              <select name="datafile" id="datafile" value={this.state.dataFile} onChange={this.onDataFileChange}>
                <option value="none">None</option>
                {this.props.testDataFiles.map(function(file) {
                  return <option value={file.name}>{file.name}</option>
                })}
              </select>
            </label>
          </div>
          <p className="datasource">
            Datasource: <a target="_blank" href={this.props.dataSource} title={this.props.dataSource}>here</a>
          </p>
          <p>
            <a href="/production">Production preview</a>
          </p>
        </form>
      </div>
    );
  },

  onDataFileChange: function(e) {
    this.updateState({
      dataFile: {$set: e.target.value}
    });
    document.forms[0].submit();
  },

  togglePause: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.executeAction(CardPlayerActions.togglePlayPause);
  }

});

module.exports = CardPlayerComponent;
