var async = require('async')
  , validator = require('is-my-json-valid')
  , jsonSchema = require('../../../static/json-schema.json')
  ;


module.exports = function generateDataModel(schema, callback) {
  async.waterfall(
    [
      function validate(callback) {
        var validate = validator(jsonSchema, {verbose: true, greedy: true});
        if (!validate(schema)) {
          var details = validate.errors
            .map(function(err) { return "\t" + err.field + " " + err.message + " " + err.value + ""; })
            .join("\n");
          callback(new Error("Invalid data schema:\n" + details));
          return;
        }

        if (schema.type !== "object") {
          callback(new Error("Top-level item in the schema must be an object."));
          return;
        }

        if (!schema.title) {
          callback(new Error("Top-level item requires a title property."));
          return;
        }

        callback(null, schema);
      },

      function resolveReferencesInSchema(schema, callback) {
        var definitions = schema.definitions;
        var exp = new RegExp("^#/definitions/(\\w+)$");

        function resolve(obj) {
          Object.keys(obj).each(function(k) {
            var ref = obj[k].$ref;
            var match;
            if (ref && (match = ref.match(exp))) {
              obj[k] = definitions[match[1]];
            }
            if (typeof obj[k] === "object")
              resolve(obj[k]);
          });
        }

        resolve(schema);
        callback(null, schema);
      },

      function(schema, callback) {
        var ast = microast.makeNode(schema);
        ast.export = true;
        var objs = {};
        ast.traverseObjs(function(obj) {
          objs[obj.name] = obj;
        });
        var output = Object.values(objs)
          .map(function(obj) {
            return obj.generate();
          })
          .join("\n\n##-------------------------------\n\n");
        callback(null, output);
      }
    ],
    callback
  );
};

var microast = {
  Obj: (function() {
    function Obj(node) {
      this.node = node;
      this.name = node.title.camelize();
      this.properties = {};
      Object.keys(node.properties)
        .each(function(propName) {this.properties[propName] = microast.makeNode(node.properties[propName]);}.bind(this));
      this.export = false;
    }

    Obj.prototype.defaultValue = function() {
      return "null";
    };
    Obj.prototype.type = function() {
      return this.name;
    };
    Obj.prototype.generate = function() {
      console.log("Generating Struct " + this.name);
      var res = [
        "struct " + this.name + " {",
        Object.keys(this.properties)
          .map(function(prop) {
            console.log("-- property: " + prop);
            return "  " + prop + ": " + this.properties[prop].type() + " = " + this.properties[prop].defaultValue();
          }.bind(this))
          .join("\n"),
        "}"
      ].join("\n");

      if (this.export) {
        res = "export " + res;
      }

      return res;
    };
    Obj.prototype.traverseObjs = function(fn) {
      fn.call(null, this);
      Object.keys(this.properties).each(function(propName) {
        var property = this.properties[propName];
        if (property instanceof microast.Obj || property instanceof microast.List) {
          property.traverseObjs(fn);
        }
      }.bind(this));
    };
    return Obj;
  }()),

  Str: (function() {
    function Str(node) {
      this.node = node;
    }

    Str.prototype.defaultValue = function() {
      return '""';
    };
    Str.prototype.type = function() {
      return 'str';
    };

    return Str;
  }()),

  Float: (function() {
    function Float(node) {
      this.node = node;
    }

    Float.prototype.defaultValue = function() {
      return '0f';
    };
    Float.prototype.type = function() {
      return 'float';
    };

    return Float;
  }()),

  Int: (function() {
    function Int(node) {
      this.node = node;
    }

    Int.prototype.defaultValue = function() {
      return '0';
    };
    Int.prototype.type = function() {
      return 'int';
    };

    return Int;
  }()),

  Bool: (function() {
    function Bool(node) {
      this.node = node;
    }

    Bool.prototype.defaultValue = function() {
      return 'false';
    };
    Bool.prototype.type = function() {
      return 'bool';
    };

    return Bool;
  }()),

  List: (function() {
    function List(node) {
      this.node = node;
      this.ofNode = microast.makeNode(node.items);
    }

    List.prototype.defaultValue = function() {
      return '[]';
    };
    List.prototype.type = function() {
      return 'list<' + this.ofNode.type() + '>';
    };
    List.prototype.traverseObjs = function(fn) {
      if(this.ofNode instanceof microast.Obj) {
        this.ofNode.traverseObjs(fn);
      }
    };

    return List;
  }()),

  makeNode: function(n) {
    switch (n.type) {
      case "object":
        return new microast.Obj(n);
      case "string":
        return new microast.Str(n);
      case "number":
        return new microast.Float(n);
      case "integer":
        return new microast.Int(n);
      case "array":
        return new microast.List(n);
      case "boolean":
        return new microast.Bool(n);
      default:
        throw new Error("Unknown type " + n.type);
    }
  }
};
