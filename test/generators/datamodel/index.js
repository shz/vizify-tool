/* globals describe, it */
var chai = require('chai');
var assert = chai.assert;

var generateDataModel = require('../../../lib/generators/datamodel');
var tokenizer = require('virgil/lib/tokenizer');
var parser = require('virgil/lib/parser');
var virgil = require('virgil');
var util = require('../../../lib/util');
var VzJson = require('vizify-javascript/lib/json');

describe("generateDataModel", function() {

  var compile = function(code, callback) {
    virgil.compileModule("dataparser.vgl", code, "javascript", {
      libs: util.parseLibs("./src/vizify"),
      namespace: "testing"
    }, callback);
  };

  var schema;
  beforeEach(function() {
    schema = {
      definitions: {
        defObject: {type: "object"},
        defObject2: {"$ref": "#/definitions/defObject"}
      },
      type: "object",
      title: "my-data",
      properties: {
        prop1: {type: "string"},
        prop2: {
          type: "integer",
          default: 35
        },
        prop3: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subprop1: {type: "string"}
            }
          }
        },
        prop4: {type: "object"},
        prop5: {"$ref": "#/definitions/defObject"}
      }
    };
  });

  describe("validate", function() {
    it("should require a schema", function(done) {
      generateDataModel.validate(null, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it("should reject invalid json schema", function(done) {
      var schema = {
        type: "yahoo"
      };
      generateDataModel.validate(schema, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it("should require the top-level entry to be an object", function(done) {
      var schema = {
        type: "array",
        title: "Top"
      };
      generateDataModel.validate(schema, function(err) {
        assert.instanceOf(err, Error);

        generateDataModel.validate({type: "object", title: "Top"}, function(err) {
          assert.ifError(err);
          done();
        })
      });
    });

    it("should require the top-level object entry to have a title", function(done) {
      var schema = {
        type: "object"
      };
      generateDataModel.validate(schema, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it("should validate", function(done) {
      generateDataModel.validate(schema, function(err) {
        assert.ifError(err);
        done();
      });
    });
  });


  describe("ensureObjectsHaveTitles", function() {
    it("should assign a unique title to each object found without a title in the schema", function(done) {
      assert.isNotString(schema.properties.prop4.title);
      assert.isNotString(schema.properties.prop3.items.title);
      assert.isNotString(schema.definitions.defObject.title);

      generateDataModel.ensureObjectsHaveTitles(schema, function(err) {
        assert.ifError(err);
        assert.isString(schema.properties.prop4.title);
        assert.isString(schema.properties.prop3.items.title);
        assert.isString(schema.definitions.defObject.title);
        assert.notEqual(schema.properties.prop4.title, schema.properties.prop3.items.title);
        assert.notEqual(schema.definitions.defObject.title, schema.properties.prop4.title);
        assert.notEqual(schema.definitions.defObject.title, schema.properties.prop3.items.title);
        done();
      });
    });

    it("should leave existing titles alone", function(done) {
      generateDataModel.ensureObjectsHaveTitles(schema, function(err) {
        assert.equal(schema.title, "my-data");
        done();
      });
    });
  });


  describe("resolveReferencesInSchema", function() {
    it("should replace $ref with actual definitions", function(done) {
      generateDataModel.resolveReferencesInSchema(schema, function(err) {
        assert.ifError(err);
        assert.notOk(schema.properties.prop5.$ref);
        assert.strictEqual(schema.properties.prop5, schema.definitions.defObject);
        assert.strictEqual(schema.definitions.defObject, schema.definitions.defObject2);
        done();
      });
    });

  });


  describe("generateVirgilCode", function() {
    var schema = {
      type: "object",
      title: "yay",
      properties: {
        things: {
          type: "array",
          items: {type: "integer"}
        }
      }
    };
    it("should generate valid virgil syntax", function(done) {
      generateDataModel.generateVirgilCode(schema, function(err, code) {
        var tokens = tokenizer(code);
        assert.ok(tokens);

        var parsed = parser.snippet(code);
        assert.ok(parsed);

        done();
      });
    });

    it("should generate virgil code that actually compiles", function(done) {
      generateDataModel.generateVirgilCode(schema, function(err, code) {
        compile(code, function(err, out) {
          assert.ok(out);
          assert.ifError(err);
          done();
        });
      });
    });
  });


  describe("run", function() {
    it("should generate virgil code that compiles", function(done) {
      generateDataModel.run(schema, function(err, code) {
        assert.ifError(err);

        compile(code, function(err, out) {
          assert.ok(out);
          assert.ifError(err);
          done();
        });
      });
    });


    describe("compiled JS code", function() {
      var schema = {
        definitions: {},
        type: "object",
        title: "widget",
        properties: {
          count: {type: "integer"},
          price: {type: "number", default: 0.5},
          name: {type: "string"},
          dinguses: {type: "array", items: {type: "object"}}
        }
      };

      it("should parse JSON that adheres to the schema", function(done) {
        var input = {
          count: 35,
          price: 12.5,
          name: "Dingodiles",
          dinguses: [{hello: "world"}, {hello: "globe"}]
        };

        generateDataModel.run(schema, function(err, code) {
          assert.ifError(err);

          compile(code, function(err, out) {
            try {
              (function(window) {
                var json = new VzJson(JSON.stringify(input));
                eval(out["dataparser.js"]);

                var slurped = window.testing.jsonToWidget(json);
                assert.instanceOf(slurped, window.testing.Widget);
                assert.notStrictEqual(slurped, input);
                assert.equal(slurped.name, input.name);
                assert.equal(slurped.count, input.count);
                assert.equal(slurped.price, input.price);
                assert.isArray(slurped.dinguses);
                assert.equal(slurped.dinguses.length, 2);
              }({}));
            } catch (e) {
              done(e);
              return;
            }

            done();
          });
        });
      });


      it("should use default values", function(done) {
        var input = {
          count: 35,
          name: "Dingodiles",
        };

        generateDataModel.run(schema, function(err, code) {
          assert.ifError(err);

          compile(code, function(err, out) {
            try {
              (function(window) {
                var json = new VzJson(JSON.stringify(input));
                eval(out["dataparser.js"]);

                var slurped = window.testing.jsonToWidget(json);
                assert.equal(slurped.price, 0.5);
              }({}));
            } catch (e) {
              done(e);
              return;
            }

            done();
          });
        });
      });

      it("should support lists of lists", function(done) {
        var schema = {
          type: "object",
          title: "thingamabob",
          properties: {
            bobs: {
              type: "array",
              items: {
                type: "array",
                items: {type: "boolean"}
              }
            }
          }
        };

        var input = {
          bobs: [
            [true, false],
            [false, true, true]
          ]
        };

        generateDataModel.run(schema, function(err, code) {
          assert.ifError(err);

          compile(code, function(err, out) {
            try {
              (function(window) {
                var json = new VzJson(JSON.stringify(input));
                eval(out["dataparser.js"]);

                var slurped = window.testing.jsonToThingamabob(json);
                assert.isArray(slurped.bobs);
                assert.isArray(slurped.bobs[0]);
                assert.isBoolean(slurped.bobs[0][0]);
              }({}));
            } catch (e) {
              done(e);
              return;
            }

            done();
          });
        });

      });

    });

  });

});
