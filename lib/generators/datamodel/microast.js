var microast = {
  Struct: (function() {
    function Struct(node) {
      this.node = node;
      this.name = node.title.camelize();
      this.properties = {};
      Object.keys(node.properties)
        .each(function(propName) {this.properties[propName] = microast.makeNode(node.properties[propName]);}.bind(this));
      this.export = false;
    }

    Struct.prototype.defaultValue = function() {
      return "null";
    };
    Struct.prototype.type = function() {
      return this.name;
    };
    Struct.prototype.generate = function() {
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

      // Throw in a maker function
      res += "\n" + [
        "function _make" + this.name + "(json:JSON) : " + this.name + " {",
        "  return new " + this.name + "(",
        Object.keys(this.properties).map(function(prop) {
          return prop + " = " + this.properties[prop].generateJsonConverter(prop);
        }.bind(this)).map(function(line) {return "    " + line}).join("\n"),
        "  )",
        "}"
      ].join("\n");

      return res;
    };
    Struct.prototype.traverseStructs = function(fn) {
      fn.call(null, this);
      Object.keys(this.properties).each(function(propName) {
        var property = this.properties[propName];
        if (property instanceof microast.Struct || property instanceof microast.List) {
          property.traverseStructs(fn);
        }
      }.bind(this));
    };
    Struct.prototype.generateJsonConverter = function (fieldname) {
      return "_make" + this.name + '(json.get("' + fieldname + '"))';
    };
    return Struct;
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
    Str.prototype.generateJsonConverter = function (fieldname) {
      return 'json.get("' + fieldname + '").asStr()';
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
    Float.prototype.generateJsonConverter = function (fieldname) {
      return 'json.get("' + fieldname + '").asFloat()';
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
    Int.prototype.generateJsonConverter = function (fieldname) {
      return 'json.get("' + fieldname + '").asInt()';
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
    Bool.prototype.generateJsonConverter = function (fieldname) {
      return 'json.get("' + fieldname + '").asBool()';
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
    List.prototype.traverseStructs = function(fn) {
      if (this.ofNode instanceof microast.Struct) {
        this.ofNode.traverseStructs(fn);
      }
    };
    List.prototype.generateJsonConverter = function (fieldname) {
      return 'json.get("' + fieldname + '").asList()';
    };

    return List;
  }()),

  makeNode: function(n) {
    switch (n.type) {
      case "object":
        return new microast.Struct(n);
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


module.exports = microast;
