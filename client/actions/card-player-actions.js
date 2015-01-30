var AppDispatcher = require('../dispatcher');

module.exports = {
  togglePlayPause: function () {
    AppDispatcher.dispatch({
      actionType: "CardPlayerTogglePlayPause"
    });
  },

  updateFrame: function (t) {
    AppDispatcher.dispatch({
      actionType: "CardPlayerUpdateFrame",
      time: t
    });
  },

  seek: function(position) {
    AppDispatcher.dispatch({
      actionType: "CardPlayerSeek",
      position: position
    });
  },

  seekToTime: function(time) {
    AppDispatcher.dispatch({
      actionType: "CardPlayerSeekToTime",
      time: time
    })
  }
};
