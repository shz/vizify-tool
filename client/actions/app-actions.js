module.exports = {
  loadFileList: function(context, payload, done) {
    context.dispatch("AppLoadFileList");
    done();
  },

  openFile: function(context, name, done) {
    context.dispatch("AppOpenFile", name);
    done();
  },

  save: function(context, payload, done) {
    context.dispatch("AppSave", {});
    done();
  },

  codeChanged: function(context, payload, done) {
    context.dispatch("AppCodeChanged", payload);
    done();
  },

  compile: function(context, payload, done) {
    context.dispatch("AppCompile");
    done();
  }
};
