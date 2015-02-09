var createStore = require('fluxible/utils/createStore');
var CardPlayerStateStore = createStore({
  storeName: 'CardPlayerStateStore',

  initialize: function() {
    this.playerState = {
      isEnded: false,
      isPaused: false,
      time: 0
    }
  },

  handlers: {
    CardPlayerReloadCard: 'handleReloadCard',
    CardPlayerTogglePlayPause: 'handleTogglePlayPause',
    CardPlayerUpdateFrame: 'handleUpdateFrame',
    CardPlayerSeek: 'handleSeek',
    CardPlayerSeekToTime: 'handleSeekToTime'
  },

  handleReloadCard: function() {
    this.playerState.reload = true;
    console.log("state store.handleReloadCard");
    this.emitChange();
  },

  handleTogglePlayPause: function() {
    if (this.playerState.isEnded) {
      this.playerState.time = 0;
      this.playerState.isPaused = false;
      this.playerState.isEnded = false;
    } else {
      this.playerState.isPaused = !this.playerState.isPaused;
    }
    this.emitChange();
  },

  handleUpdateFrame: function(payload) {
    if (this.playerState.isPaused) {
      return;
    }

    this.playerState.time = payload.time;
    if (this.playerState.duration && this.playerState.time === this.playerState.duration) {
      this.playerState.isPaused = true;
      this.playerState.isEnded = true;
    }
    this.emitChange();
  },

  handleSeek: function(payload) {
    if (!this.playerState.duration) {
      return;
    }
    this.handleSeekToTime({time: Math.floor(payload.position * this.playerState.duration)});
  },

  handleSeekToTime: function(payload) {
    if (!this.playerState.duration) {
      return;
    }
    this.playerState.time = Math.max(0, Math.min(this.playerState.duration, payload.time));
    this.playerState.isPaused = true;

    if (this.playerState.duration && this.playerState.time === this.playerState.duration) {
      this.playerState.isEnded = true;
    } else {
      this.playerState.isEnded = false;
    }

    this.emitChange();
  },

  getState: function() {
    return this.playerState;
  }
});
module.exports = CardPlayerStateStore;
