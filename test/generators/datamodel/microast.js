/* globals describe, it */
var chai = require('chai');
var assert = chai.assert;

var microast = require('../../../lib/generators/datamodel/microast');
var datamodelGenerator = require('../../../lib/generators/datamodel');
var parser = require('virgil/lib/parser');

describe("generators/datamodel/microast", function() {
  describe("Struct", function() {
    var schemaElement;
    var struct;

    beforeEach(function(done) {
      schemaElement = {
        type: "object",
        title: "test-object",
        properties: {
          foo: {type: "integer"},
          bar: {type: "boolean"},
          baz: {type: "number"},
          garply: {type: "string"},
          qux: {
            type: "object",
            properties: {
              a: {type: "integer"}
            }
          },
          waldo: {
            type: "array",
            items: {type: "string"}
          }
        }
      };
      datamodelGenerator.ensureObjectsHaveTitles(schemaElement, function() {
        struct = new microast.Struct(schemaElement);
        done();
      });
    });

    describe("constructor", function() {
      it("should initialize with a schema element", function() {
        assert.strictEqual(struct.node, schemaElement);
      });

      it("should create a properties property with child nodes", function() {
        var props = struct.properties;
        assert.instanceOf(props.foo, microast.Int);
        assert.instanceOf(props.bar, microast.Bool);
        assert.instanceOf(props.baz, microast.Float);
        assert.instanceOf(props.garply, microast.Str);
        assert.instanceOf(props.qux, microast.Struct);
        assert.instanceOf(props.waldo, microast.List);
      });
    });

    describe("default and type", function() {
      it("should have a default value of `null`", function() {
        assert.equal(struct.defaultValue(), "null");
      });

      it("should have a camelized Virgil type name", function() {
        assert.equal(struct.virgilType(), "TestObject");
      });
    });

    describe("codegen", function() {
      it("should generate code for a Virgil struct statement", function() {
        var code = struct.generate();
        var parsed = parser.snippet(code)[0];
        assert.equal(parsed.constructor.name, "StructStatement");
      });

      it("should generate code for an exported Virgil struct statement", function() {
        struct.export = true;
        var code = struct.generate();
        var parsed = parser.snippet(code)[0];
        assert.isTrue(parsed.ex);
        assert.equal(parsed.constructor.name, "StructStatement");
      });

      it("should generate code for an exported maker function that converts Json to struct", function() {
        struct.export = true;
        var code = struct.generate();
        var parsed = parser.snippet(code)[1];
        assert.isTrue(parsed.ex);
        assert.equal(parsed.constructor.name, "FunctionStatement");
        assert.equal(parsed.name, "jsonToTestObject");
        assert.equal(parsed.returnType.name, "TestObject");
        assert.equal(parsed.args[0][1].name, "JSON");
      });

      it("should generate a maker function that converts Json to struct", function() {
        var code = struct.generateMakerFunction();
        var parsed = parser.snippet(code)[0];
        assert.equal(parsed.constructor.name, "FunctionStatement");
        assert.equal(parsed.name, "make__StructTestObject");
        assert.equal(parsed.returnType.name, "TestObject");
        assert.equal(parsed.args[0][1].name, "JSON");
      });

      it("should generate an expression that calls the maker function", function() {
        var code = struct.generateJsonConversionExpression("asdf");
        assert.equal(code, 'make__StructTestObject(json.get("asdf"))');
      });
    });

    describe("traverse", function() {
      it("should apply the function to itself", function() {
        assert.notOk(struct.touched);
        struct.traverse(function(node) {
          node.touched = true;
        });
        assert.isTrue(struct.touched);
      });

      it("should apply the function to its properties", function() {
        assert.notOk(struct.properties.foo.touched);
        struct.traverse(function(node) {
          node.touched = true;
        });
        assert.isTrue(struct.properties.foo.touched);
        assert.isTrue(struct.properties.bar.touched);
        assert.isTrue(struct.properties.baz.touched);
      });
    });
  });


  describe("List", function() {
    var schemaElement;
    var list;

    beforeEach(function(done) {
      schemaElement = {
        type: "array",
        items: {
          type: "string"
        }
      };
      list = new microast.List(schemaElement);
      done();
    });

    describe("constructor", function() {
      it("should initialize with a schema element", function() {
        assert.strictEqual(list.node, schemaElement);
      });

      it("should create an ofNode property with the type corresponding to what the list contains", function() {
        assert.instanceOf(list.ofNode, microast.Str);
      });
    });

    describe("default and type", function() {
      it("should have a default value of `[]`", function() {
        assert.equal(list.defaultValue(), "[]");
      });

      it("should have a Virgil type name that includes the specific type of its members", function() {
        assert.equal(list.virgilType(), "list<str>");
      });
    });

    describe("codegen", function() {
      it("should generate a maker function that converts Json to list<'T>", function() {
        var code = list.generateMakerFunction();
        var parsed = parser.snippet(code)[0];
        assert.equal(parsed.constructor.name, "FunctionStatement");
        assert.equal(parsed.name, "make__listOf_str");
        assert.equal(parsed.returnType.name, "list");
        assert.equal(parsed.returnType.generics[0].name, "str");
        assert.equal(parsed.args[0][1].name, "list");
        assert.equal(parsed.args[0][1].generics[0].name, "JSON");
      });

      it("should generate an expression that calls the maker function", function() {
        var code = list.generateJsonConversionExpression("asdf");
        assert.equal(code, 'make__listOf_str(json.get("asdf").asList())');
      });
    });

    describe("traverse", function() {
      it("should apply the function to itself", function() {
        assert.notOk(list.touched);
        list.traverse(function(node) {
          node.touched = true;
        });
        assert.isTrue(list.touched);
      });

      it("should apply the function to its member type", function() {
        assert.notOk(list.ofNode.touched);
        list.traverse(function(node) {
          node.touched = true;
        });
        assert.isTrue(list.ofNode.touched);
      });
    });
  });


  var testCases = {
    Str: {
      schema: "string",
      vgType: "str",
      vgDef: '""'
    },
    Float: {
      schema: "number",
      vgType: "float",
      vgDef: "0f"
    },
    Int: {
      schema: "integer",
      vgType: "int",
      vgDef: "0"
    },
    Bool: {
      schema: "boolean",
      vgType: "bool",
      vgDef: "false"
    }
  };

  Object.keys(testCases).each(function(astType) {
    var testCase = testCases[astType];
    describe(astType, function() {
      var str;
      var schemaElement;
      beforeEach(function() {
        schemaElement = {type: testCase.schema};
        str = new microast[astType](schemaElement);
      });

      describe("constructor", function() {
        it("should initialize with a schema element", function() {
          assert.strictEqual(str.node, schemaElement);
        });
      });

      describe("default and type", function() {
        it("should have a default value of " + testCase.vgDef, function() {
          assert.equal(str.defaultValue(), testCase.vgDef);
        });

        it("should have a Virgil type name of `" + testCase.vgType + "`", function() {
          assert.equal(str.virgilType(), testCase.vgType);
        });
      });

      describe("codegen", function() {
        it("should generate an expression that converts json to " + testCase.vgType, function() {
          var code = str.generateJsonConversionExpression("asdf");
          assert.equal(code, 'json.get("asdf").as' + testCase.vgType.camelize() + '()');
        });
      });

      describe("traverse", function() {
        it("should apply the function to itself", function() {
          assert.notOk(str.touched);
          str.traverse(function(node) {
            node.touched = true;
          });
          assert.isTrue(str.touched);
        });
      });
    });
  });

  describe("makeNode", function() {
    var map = {
      string: "Str",
      number: "Float",
      integer: "Int",
      boolean: "Bool"
    };
    Object.keys(map).each(function(type) {
      it("should map " + type + " to microast." + map[type], function() {
        assert.instanceOf(microast.makeNode({type: type}), microast[map[type]]);
      });
    });

    it("should map object to microast.Struct", function() {
      assert.instanceOf(microast.makeNode({type: "object", title: "a"}), microast.Struct);
    });

    it("should map array to microast.List", function() {
      assert.instanceOf(microast.makeNode({type: "array", items: {type: "string"}}), microast.List);
    });
  });
});
