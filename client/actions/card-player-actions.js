module.exports = {
  reloadCard: function(context, duration, done) {
    context.dispatch("CardPlayerReloadCard", {duration: duration});
    context.dispatch("AppCardReloaded");
    done();
  },

  togglePlayPause: function(context, payload, done) {
    context.dispatch("CardPlayerTogglePlayPause", {});
    done();
  },

  updateFrame: function(context, t, done) {
    context.dispatch("CardPlayerUpdateFrame", {time: t});
    done();
  },

  seek: function(context, position, done) {
    context.dispatch("CardPlayerSeek", {position: position});
    done();
  },

  seekToTime: function(context, time, done) {
    context.dispatch("CardPlayerSeekToTime", {time: time});
    done();
  }
};
