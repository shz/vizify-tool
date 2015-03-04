module.exports = {
  reloadCard: function(context, payload, done) {
    context.dispatch("CardPlayerReloadCard", {duration: payload.duration});
    context.dispatch("AppCardReloaded");
    done();
  },

  togglePlayPause: function(context, payload, done) {
    context.dispatch("CardPlayerTogglePlayPause", {});
    done();
  },

  updateFrame: function(context, payload, done) {
    context.dispatch("CardPlayerUpdateFrame", {time: payload.t});
    done();
  },

  seek: function(context, payload, done) {
    context.dispatch("CardPlayerSeek", {position: payload.completionRate});
    done();
  },

  seekToTime: function(context, time, done) {
    context.dispatch("CardPlayerSeekToTime", {time: time});
    done();
  }
};
