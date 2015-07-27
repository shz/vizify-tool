require('sugar');
var fs = require('fs')
  , path = require('path')
  ;

var DEFAULT_LIBS = {
  vizify: path.join(__dirname, '..', 'src', 'vizify')
};
var JSON_FILE = 'vizify.json';
var MAIN_VGL = 'main.vgl';
var SAMPLE_DATA_DIR = 'sample-data';

var VizData = module.exports = function VizData(dir) {
  this.dir = dir;

  this.hasMain = false;
  this.mainVgl = '';
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

  // Read card.json
  fs.readFile(path.join(self.dir, JSON_FILE), {encoding: 'utf8'}, function(err, data) {
    if (err) {
      self.hasJSON = false;
      data = {};
    } else {
      self.hasJSON = true;
      data = JSON.parse(data);
    }

    // Read main.vgl
    fs.readFile(path.join(self.dir, MAIN_VGL), {encoding: 'utf8'}, function(err, data) {
      if (err) {
        self.hasMain = true;
        self.mainVgl = data;
      } else {
        self.hasMain = false;
        self.mainVgl = '';
      }

      // Get list of sample data
      fs.readdir(path.join(self.dir, SAMPLE_DATA_DIR), function(err, files) {
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
  });
};

VizData.prototype.assert = function(spec) {
  if (spec.hasJSON && !this.hasJSON) {
    throw new Error('Missing ' + JSON_FILE);
  }
  if (spec.hasMain && !this.hasMain) {
    throw new Error('Missing ' + MAIN_VGL);
  }
  if (spec.hasSampleData && !this.hasSampleData) {
    throw new Error('Missing ' + SAMPLE_DATA_DIR);
  }
};

//
// Available options:
//
//  * debug
//  * libs
//
VizData.prototype.compile = function(language, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  this.assert({
    hasMain: true,
    hasJSON: true
  });

  virgil.compile(this.mainVgl, language, {
    filename: path.join('.', 'src', MAIN_VGL),
    debug: !!options.debug,
    prune: true,
    libs: options.libs || DEFAULT_LIBS,
    convert: {
      namespace: this.name.camelize(false),
      browserify: !!options.pack
    }
  }, callback);
};
