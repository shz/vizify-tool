var fs = require('fs')
  , path = require('path')
  ;

var VizData = module.exports = function VizData(dir) {
  this.dir = dir;

  this.hasJSON = false;
  this.hasSampleData = false;
  this.size = {
    width: 0,
    height: 0
  };
  this.name = 'unnamed';
  this.version = '1.0.0';
  this.sampleData = [];
};

VizData.prototype.read = function(callback) {
  var self = this;

  fs.readFile(path.join(self.dir, 'card.json'), {encoding: 'utf8'}, function(err, data) {
    if (err) {
      self.hasJSON = false;
      data = {};
    } else {
      self.hasJSON = true;
      data = JSON.parse(data);
    }

    fs.readdir(path.join(self.dir, 'sample-data'), function(err, files) {
      if (err) {
        self.hasSampleData = false;
      }

      self.sampleData = files;
      if (!files.length) {
        self.hasSampleData = false;
      } else {
        self.hasSampleData = true;
      }

      if (data.name !== undefined) {
        self.name = data.name;
      }
      if (data.version !== undefined) {
        self.version = data.version
      }
      if (data.size) {
        if (data.size.width !== undefined) {
          self.size.width = data.size.width;
        }
        if (data.size.height !== undefined) {
          self.size.height = data.size.height;
        }
      }

      callback();
    });
  });
};


