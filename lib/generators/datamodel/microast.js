require('sugar');

var microast = {

  /**
   * A virgil struct
   */
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

    Struct.prototype.virgilType = function() {
      return this.node.title.camelize();
    };

    Struct.prototype.generate = function() {
      var res = [
        "struct " + this.virgilType() + " {",
        Object.keys(this.properties)
          .map(function(prop) {
            return "  " + prop + ": " + this.properties[prop].virgilType() + " = " + this.properties[prop].defaultValue();
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
        "function make__" + this.name + "(json:JSON) : " + this.virgilType() + " {",
        "  if json == null {",
        "    return null",
        "  }",
        "  let instance = new " + this.virgilType() + "",
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


  /**
   * A virgil str
   */
  Str: (function() {
    function Str(node) {
      this.node = node;
      this.name = "str";
    }

    Str.prototype.defaultValue = function() {
      return '""';
    };
    Str.prototype.virgilType = function() {
      return 'str';
    };
    Str.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asStr()';
    };

    return Str;
  }()),


  /**
   * A virgil float
   */
  Float: (function() {
    function Float(node) {
      this.node = node;
      this.name = "float";
    }

    Float.prototype.defaultValue = function() {
      return '0f';
    };
    Float.prototype.virgilType = function() {
      return 'float';
    };
    Float.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asFloat()';
    };

    return Float;
  }()),


  /**
   * A virgil int
   */
  Int: (function() {
    function Int(node) {
      this.node = node;
      this.name = "int";
    }

    Int.prototype.defaultValue = function() {
      return '0';
    };
    Int.prototype.virgilType = function() {
      return 'int';
    };
    Int.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asInt()';
    };

    return Int;
  }()),


  /**
   * A virgil bool
   */
  Bool: (function() {
    function Bool(node) {
      this.node = node;
      this.name = "bool";
    }

    Bool.prototype.defaultValue = function() {
      return 'false';
    };
    Bool.prototype.virgilType = function() {
      return 'bool';
    };
    Bool.prototype.generateJsonConverter = function(fieldname) {
      return 'json.get("' + fieldname + '").asBool()';
    };

    return Bool;
  }()),


  /**
   * A virgil list<'T>
   */
  List: (function() {
    function List(node) {
      this.node = node;
      this.ofNode = microast.makeNode(node.items);
      this.name = "listOf_" + this.ofNode.name;
    }

    List.prototype.defaultValue = function() {
      return '[]';
    };
    List.prototype.virgilType = function() {
      return 'list<' + this.ofNode.virgilType() + '>';
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
      if (this.ofNode instanceof microast.Struct) {
        asType = "make__" + this.ofNode.name + "(json)";
      } else if (this.ofNode instanceof microast.List) {
        asType = "make__" + this.ofNode.name + "(json.asList())";
      } else {
        asType = "json.as" + this.ofNode.virgilType().camelize() + "()";
      }

      return [
        "function make__" + this.name + "(jsonList:list<JSON>) : " + this.virgilType() + " {",
        "  let theList:" + this.virgilType() + " = []",
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


  /**
   * Maps a JSON Schema node to a node from this micro-AST.
   * @param jsonSchemaNode
   * @return {*}
   */
  makeNode: function(jsonSchemaNode) {
    switch (jsonSchemaNode.type) {
      case "object":
        return new microast.Struct(jsonSchemaNode);
      case "string":
        return new microast.Str(jsonSchemaNode);
      case "number":
        return new microast.Float(jsonSchemaNode);
      case "integer":
        return new microast.Int(jsonSchemaNode);
      case "array":
        return new microast.List(jsonSchemaNode);
      case "boolean":
        return new microast.Bool(jsonSchemaNode);
      default:
        throw new Error("Unknown JSON type " + jsonSchemaNode.type);
    }
  }
};


module.exports = microast;
