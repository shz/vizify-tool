module.exports = {
  openFile: function(context, name, done) {
    context.dispatch("AppOpenFile", name);
    done();
  },

  save: function(context, payload, done) {
    context.dispatch("AppSave", {});
    done();
  },

  codeChanged: function(context, payload, done) {
    context.dispatch("AppCodeChanged");
    done();
  },

  compile: function(context, payload, done) {
    context.dispatch("AppCompile");
    done();
  },

  reloadCard: function(context, duration, done) {
    context.dispatch("CardPlayerReloadCard", {duration: duration});
    done();
  }
};
