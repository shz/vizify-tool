var util = require('util');
var events = require('events');
var AppDispatcher = require('../dispatcher');

// Class definition
var CardPlayerStateStore = (function() {
  function CardPlayerStateStore() {
    events.EventEmitter.call(this);
    this.playerState = {
      isEnded: false,
      isPaused: false,
      time: 0
    }
  }

  util.inherits(CardPlayerStateStore, events.EventEmitter);

  CardPlayerStateStore.CHANGE_EVENT = 'change';

  CardPlayerStateStore.prototype.addChangeListener = function(callback) {
    this.on(CardPlayerStateStore.CHANGE_EVENT, callback);
  };

  CardPlayerStateStore.prototype.removeChangeListener = function(callback) {
    this.removeListener(CardPlayerStateStore.CHANGE_EVENT, callback);
  };

  CardPlayerStateStore.prototype.emitChange = function() {
    this.emit(CardPlayerStateStore.CHANGE_EVENT);
  };

  return CardPlayerStateStore;
}());


// Create an instance and export it
var storeInstance = new CardPlayerStateStore();
module.exports = storeInstance;


// Register callback to handle all updates
storeInstance.dispatchToken = AppDispatcher.register(function(action) {
  if (actionHandlers.hasOwnProperty(action.actionType)) {
    actionHandlers[action.actionType](action);
  }
});
var actionHandlers = {
  CardPlayerTogglePlayPause: function(action) {
    if (storeInstance.playerState.isEnded) {
      storeInstance.playerState.time = 0;
      storeInstance.playerState.isPaused = false;
      storeInstance.playerState.isEnded = false;
    } else {
      storeInstance.playerState.isPaused = !storeInstance.playerState.isPaused;
    }
    storeInstance.emitChange();
  },

  CardPlayerUpdateFrame: function(action) {
    storeInstance.playerState.time = action.time;
    if (storeInstance.playerState.duration && storeInstance.playerState.time === storeInstance.playerState.duration) {
      storeInstance.playerState.isPaused = true;
      storeInstance.playerState.isEnded = true;
    }
    storeInstance.emitChange();
  },

  CardPlayerSeek: function(action) {
    if (!storeInstance.playerState.duration) {
      return;
    }
    this.CardPlayerSeekToTime({time: Math.floor(action.position * storeInstance.playerState.duration)});
  },

  CardPlayerSeekToTime: function(action) {
    if (!storeInstance.playerState.duration) {
      return;
    }
    storeInstance.playerState.time = Math.max(0, Math.min(storeInstance.playerState.duration, action.time));
    storeInstance.playerState.isPaused = true;

    if (storeInstance.playerState.duration && storeInstance.playerState.time === storeInstance.playerState.duration) {
      storeInstance.playerState.isEnded = true;
    } else {
      storeInstance.playerState.isEnded = false;
    }

    storeInstance.emitChange();
  }
};
