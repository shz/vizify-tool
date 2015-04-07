var async = require('async')
  , validator = require('is-my-json-valid')
  , jsonSchema = require('../../../static/json-schema.json')
  , microast = require('./microast')
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

      function ensureObjectsHaveTitles(schema, callback) {
        var definitions = schema.definitions;
        var anonymousStructCount = 0;
        function ensure(obj) {
          if(obj.type === "object" && !obj.title) {
            obj.title = "Data" + anonymousStructCount;
            anonymousStructCount++;
          }
          if(obj.type === "object") {
            obj.properties = obj.properties || {};
            Object.values(obj.properties).each(ensure);
          } else if(obj.type === "array") {
            ensure(obj.items);
          }
        }

        ensure(schema);
        if(definitions) {
          Object.values(definitions).each(ensure);
        }

        callback(null, schema);
      },

      function resolveReferencesInSchema(schema, callback) {
        var definitions = schema.definitions;
        var anonymousStructCount = 0;
        Object.values(schema.definitions).each(function(def) {
          if(def.type === "object" && !def.title) {
            def.title = "Data" + anonymousStructCount;
            anonymousStructCount++;
          }
        });
        var exp = new RegExp("^#/definitions/(\\w+)$");

        function resolve(obj) {
          Object.keys(obj).each(function(k) {
            var ref = obj[k].$ref;
            var match;
            if (ref && (match = ref.match(exp))) {
              obj[k] = definitions[match[1]];
            }

            if (typeof obj[k] === "object") {
              resolve(obj[k]);
            }
          });
        }

        resolve(schema);
        callback(null, schema);
      },

      function codegen(schema, callback) {
        var rootAstNode = microast.makeNode(schema);
        rootAstNode.export = true;

        var allKnownStructs = {};
        var allKnownLists = {};
        rootAstNode.traverse(function(astNode) {
          if (astNode instanceof microast.Struct) {
            allKnownStructs[astNode.name] = astNode;
          } else if (astNode instanceof microast.List) {
            allKnownLists[astNode.name] = astNode;
          }
        });

        var output = Object.values(allKnownStructs)
          .map(function(obj) {
            return obj.generate() + "\n" + obj.generateMakerFunction();
          }).concat(Object.values(allKnownLists).map(function(list) {return list.generateMakerFunction();}));

        callback(null, rootAstNode, output);
      },

      function wrap(rootAstNode, output, callback) {
        output = [
          "import vizify.json",
          "export function jsonTo" + rootAstNode.virgilType() + "(json:JSON) : " + rootAstNode.virgilType() + " { return make__" + rootAstNode.name + "(json) }"
        ].concat(output);
        callback(null, output.join("\n\n"));
      }
    ],

    callback
  );
};
