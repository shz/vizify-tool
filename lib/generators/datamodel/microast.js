require('sugar');

var microast = {
  Struct: (function() {
    function Struct(node) {
      this.node = node;
      this.name = "Struct" + node.title.camelize();
      this.properties = {};
      Object.keys(node.properties)
        .each(function(propName) {this.properties[propName] = microast.makeNode(node.properties[propName]);}.bind(this));
      this.export = false;
    }

    Struct.prototype.defaultValue = function() {
      return "null";
    };
    Struct.prototype.type = function() {
      return this.node.title.camelize();
    };
    Struct.prototype.generate = function() {
      var res = [
        "struct " + this.type() + " {",
        Object.keys(this.properties)
          .map(function(prop) {
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
    Struct.prototype.generateMakerFunction = function() {
      // Throw in a maker function
      return [
        "function make__" + this.name + "(json:JSON) : " + this.type() + " {",
        "  if json == null {",
        "    return null",
        "  }",
        "  let instance = new " + this.type() + "",
        Object.keys(this.properties)
          .map(function(prop) {
            return [
              "  let json__" + prop + ' = json.get("' + prop + '")',
              "  if json__" + prop + " != null { instance." + prop + " = " + this.properties[prop].generateJsonConverter(prop) + " }"
            ].join("\n");
          }.bind(this))
          .join("\n"),
        "  return instance",
        "}"
      ].join("\n");
    };
    Struct.prototype.traverse = function(fn) {
      fn.call(null, this);
      Object.keys(this.properties).each(function(propName) {
        var property = this.properties[propName];
        if (property instanceof microast.Struct || property instanceof microast.List) {
          property.traverse(fn);
        }
      }.bind(this));
    };
    Struct.prototype.generateJsonConverter = function(fieldname) {
      return "make__" + this.name + '(json.get("' + fieldname + '"))';
    };
    return Struct;
  }()),

  Str: (function() {
    function Str(node) {
      this.node = node;
      this.name = "str";
    }

    Str.prototype.defaultValue = function() {
      return '""';
    };
    Str.prototype.type = function() {
      return 'str';
    };
    Str.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asStr()';
    };

    return Str;
  }()),

  Float: (function() {
    function Float(node) {
      this.node = node;
      this.name = "float";
    }

    Float.prototype.defaultValue = function() {
      return '0f';
    };
    Float.prototype.type = function() {
      return 'float';
    };
    Float.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asFloat()';
    };

    return Float;
  }()),

  Int: (function() {
    function Int(node) {
      this.node = node;
      this.name = "int";
    }

    Int.prototype.defaultValue = function() {
      return '0';
    };
    Int.prototype.type = function() {
      return 'int';
    };
    Int.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asInt()';
    };

    return Int;
  }()),

  Bool: (function() {
    function Bool(node) {
      this.node = node;
      this.name = "bool";
    }

    Bool.prototype.defaultValue = function() {
      return 'false';
    };
    Bool.prototype.type = function() {
      return 'bool';
    };
    Bool.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asBool()';
    };

    return Bool;
  }()),

  List: (function() {
    function List(node) {
      this.node = node;
      this.ofNode = microast.makeNode(node.items);
      this.name = "listOf_" + this.ofNode.name;
    }

    List.prototype.defaultValue = function() {
      return '[]';
    };
    List.prototype.type = function() {
      return 'list<' + this.ofNode.type() + '>';
    };
    List.prototype.traverse = function(fn) {
      fn.call(null, this);
      if (this.ofNode instanceof microast.Struct || this.ofNode instanceof microast.List) {
        this.ofNode.traverse(fn);
      }
    };
    List.prototype.generateJsonConverter = function(fieldname) {
      return "make__" + this.name + '(json.get("' + fieldname + '").asList())';
    };
    List.prototype.generateMakerFunction = function() {
      var asType;
      if (microast.simpleTypes.indexOf(this.ofNode.name) > -1) {
        asType = "json.as" + this.ofNode.name.camelize() + "()";
      } else if (this.ofNode instanceof microast.Struct) {
        asType = "make__" + this.ofNode.name + "(json)";
      } else if (this.ofNode instanceof microast.List) {
        asType = "make__" + this.ofNode.name + "(json.asList())";
      } else {
        throw new Error("Unknown type " + this.ofNode.name);
      }
      return [
        "function make__" + this.name + "(jsonList:list<JSON>) : " + this.type() + " {",
        "  let theList:" + this.type() + " = []",
        "  for i = 0 upto jsonList.length {",
        "    let json = jsonList[i]",
        "    theList.push(" + asType + ")",
        "  }",
        "  return theList",
        "}"
      ].join("\n");
    };
    return List;
  }()),

  simpleTypes: ["str", "bool", "int", "float"],

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
