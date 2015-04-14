require('sugar');


var AbstractNode = (function() {
  function AbstractNode(node) {
    this.node = node;
  }

  /**
   * Default value in virgil.
   */
  AbstractNode.prototype.defaultValue = null;

  /**
   * Corresponding virgil type
   */
  AbstractNode.prototype.virgilType = null;

  /**
   * Generates virgil code for its definition
   */
  AbstractNode.prototype.generate = null;

  /**
   * Virgil expression that returns the correctly-typed value of the property.
   * @param jsonVarName
   * @return {string}
   */
  AbstractNode.prototype.generateJsonConversionExpression = function(jsonVarName) {
    return jsonVarName + '.as' + this.virgilType().camelize() + "()";
  };

  /**
   * Traversal function
   * @param fn
   */
  AbstractNode.prototype.traverse = function(fn) {
    fn.call(null, this);
  };

  AbstractNode.prototype.toString = function() {
    return "<" + this.constructor.name + ":" + this.name + ">";
  };

  return AbstractNode;
}());


/**
 * A virgil struct
 */
var Struct = (function() {
  function Struct(node) {
    AbstractNode.call(this, node);

    this.name = "Struct" + node.title.camelize();
    this.properties = {};
    if (node.properties) {
      Object.keys(node.properties)
        .each(function(propName) {
          this.properties[propName] = microast.makeNode(node.properties[propName]);
        }.bind(this));
    }

    this.isRoot = false;
  }

  Object.merge(Struct.prototype, AbstractNode.prototype);

  Struct.prototype.defaultValue = function() {
    return "null";
  };

  Struct.prototype.virgilType = function() {
    return this.node.title.camelize();
  };

  Struct.prototype.generate = function() {
    var res = [
      "export struct " + this.virgilType() + " {",
      Object.keys(this.properties)
        .map(function(prop) {
          return "  " + prop + ": " + this.properties[prop].virgilType() + " = " + this.properties[prop].defaultValue();
        }.bind(this))
        .join("\n"),
      "}"
    ].join("\n");

    // If exported, declare the Struct as such and expose a well-named maker function
    if (this.isRoot) {
      res += "\n" +
             "export function jsonTo" + this.virgilType() + "(json:JSON) : " + this.virgilType() + " {\n" +
             "  return " + this.makerFunctionName() + "(json)\n" +
             "}";
    }

    return res;
  };

  Struct.prototype.makerFunctionName = function () {
    return "make" + this.name;
  };

  Struct.prototype.generateMakerFunction = function() {
    return [
      "function " + this.makerFunctionName() + "(json:JSON) : " + this.virgilType() + " {",
      "  if json.isNull() {",
      "    return null",
      "  }",
      "  let instance = new " + this.virgilType(),
      Object.keys(this.properties)
        .map(function(prop) {
          var jsonVarName = "json" + prop.camelize();
          return [
            "  let " + jsonVarName + ' = json.get("' + prop + '")',
            "  if !" + jsonVarName + ".isNull() { instance." + prop + " = " + this.properties[prop].generateJsonConversionExpression(jsonVarName) + " }"
          ].join("\n");
        }.bind(this))
        .join("\n\n"),
      "  return instance",
      "}"
    ].join("\n");
  };

  Struct.prototype.traverse = function(fn) {
    fn.call(null, this);
    Object.values(this.properties).each(function(property) {
      property.traverse(fn);
    });
  };

  Struct.prototype.generateJsonConversionExpression = function(jsonVarName) {
    return this.makerFunctionName() + '(' + jsonVarName + ')';
  };

  return Struct;
}());


/**
 * A virgil str
 */
var Str = (function() {
  function Str(node) {
    AbstractNode.call(this, node);
    this.node = node;
    this.name = "str";
  }

  Object.merge(Str.prototype, AbstractNode.prototype);

  Str.prototype.defaultValue = function() {
    if (this.node.default) {
      return '"' + this.node.default + '"';
    }
    return '""';
  };

  Str.prototype.virgilType = function() {
    return 'str';
  };

  return Str;
}());


/**
 * A virgil float
 */
var Float = (function() {
  function Float(node) {
    AbstractNode.call(this, node);
    this.name = "float";
  }

  Object.merge(Float.prototype, AbstractNode.prototype);

  Float.prototype.defaultValue = function() {
    if (this.node.default) {
      return this.node.default + 'f';
    }
    return '0f';
  };

  Float.prototype.virgilType = function() {
    return 'float';
  };

  return Float;
}());


/**
 * A virgil int
 */
var Int = (function() {
  function Int(node) {
    AbstractNode.call(this, node);
    this.name = "int";
  }

  Object.merge(Int.prototype, AbstractNode.prototype);

  Int.prototype.defaultValue = function() {
    if (this.node.default) {
      return this.node.default.toString();
    }
    return '0';
  };

  Int.prototype.virgilType = function() {
    return 'int';
  };

  return Int;
}());


/**
 * A virgil bool
 */
var Bool = (function() {
  function Bool(node) {
    AbstractNode.call(this, node);
    this.name = "bool";
  }

  Object.merge(Bool.prototype, AbstractNode.prototype);

  Bool.prototype.defaultValue = function() {
    if (this.node.default) {
      return 'true';
    }

    return 'false';
  };

  Bool.prototype.virgilType = function() {
    return 'bool';
  };

  return Bool;
}());


/**
 * A virgil list<'T>
 */
var List = (function() {
  function List(node) {
    AbstractNode.call(this, node);
    this.ofNode = microast.makeNode(node.items);
    this.name = "listOf" + this.ofNode.name.camelize();
  }

  Object.merge(List.prototype, AbstractNode.prototype);

  List.prototype.defaultValue = function() {
    return '[]';
  };

  List.prototype.virgilType = function() {
    return 'list<' + this.ofNode.virgilType() + '>';
  };

  List.prototype.traverse = function(fn) {
    fn.call(null, this);
    this.ofNode.traverse(fn);
  };

  List.prototype.generateJsonConversionExpression = function(jsonVarName) {
    return this.makerFunctionName() + '(' + jsonVarName + '.asList())';
  };

  List.prototype.makerFunctionName = function() {
    return "make" + this.name.camelize();
  };

  List.prototype.generateMakerFunction = function() {
    var asType;
    if (this.ofNode instanceof Struct) {
      asType = this.ofNode.makerFunctionName() + "(json)";
    } else if (this.ofNode instanceof List) {
      asType = this.ofNode.makerFunctionName() + "(json.asList())";
    } else {
      asType = "json.as" + this.ofNode.virgilType().camelize() + "()";
    }

    return [
      "function " + this.makerFunctionName() + "(jsonList:list<JSON>) : " + this.virgilType() + " {",
      "  let theList:" + this.virgilType() + " = []",
      "  for i = 0 upto jsonList.length {",
      "    let json = jsonList[i]",
      "    if json.isNull() {",
      "      let defaultValue:" + this.ofNode.virgilType() + " = " + this.ofNode.defaultValue(),
      "      theList.push(defaultValue)",
      "    } else {",
      "      theList.push(" + asType + ")",
      "    }",
      "  }",
      "  return theList",
      "}"
    ].join("\n");
  };

  return List;
}());


var microast = {
  Struct: Struct,
  Str: Str,
  Int: Int,
  Float: Float,
  Bool: Bool,
  List: List,

  /**
   * Maps a JSON Schema node to a node from this micro-AST.
   * @param jsonSchemaNode
   * @return {*}
   */
  makeNode: function(jsonSchemaNode) {
    switch (jsonSchemaNode.type) {
      case "object":
        return new Struct(jsonSchemaNode);
      case "string":
        return new Str(jsonSchemaNode);
      case "number":
        return new Float(jsonSchemaNode);
      case "integer":
        return new Int(jsonSchemaNode);
      case "array":
        return new List(jsonSchemaNode);
      case "boolean":
        return new Bool(jsonSchemaNode);
      default:
        throw new Error("Unknown JSON type " + jsonSchemaNode.type);
    }
  }
};


module.exports = microast;
