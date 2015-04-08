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

      it("should generate code for an exported Virgil struct statement", function () {
        struct.export = true;
        var code = struct.generate();
        var parsed = parser.snippet(code)[0];
        assert.isTrue(parsed.ex);
        assert.equal(parsed.constructor.name, "StructStatement");
      });

      it("should generate code for an exported maker function that converts Json to struct", function () {
        struct.export = true;
        var code = struct.generate();
        var parsed = parser.snippet(code)[1];
        assert.isTrue(parsed.ex);
        assert.equal(parsed.constructor.name, "FunctionStatement");
        assert.equal(parsed.name, "jsonToTestObject");
        assert.equal(parsed.returnType.name, "TestObject");
        assert.equal(parsed.args[0][1].name, "JSON");
      });

      it("should generate a maker function that converts Json to struct", function () {
        var code = struct.generateMakerFunction();
        var parsed = parser.snippet(code)[0];
        assert.equal(parsed.constructor.name, "FunctionStatement");
        assert.equal(parsed.name, "make__StructTestObject");
        assert.equal(parsed.returnType.name, "TestObject");
        assert.equal(parsed.args[0][1].name, "JSON");
      });

      it("should generate an expression that calls the maker function", function () {
        var code = struct.generateJsonConversionExpression("asdf");
        assert.equal(code, 'make__StructTestObject(json.get("asdf"))');
      });
    });

    describe("traverse", function () {
      it("should apply the function to itself", function () {
        assert.notOk(struct.touched);
        struct.traverse(function(node) {
          node.touched = true;
        });
        assert.isTrue(struct.touched);
      });

      it("should apply the function to its properties", function () {
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
});
