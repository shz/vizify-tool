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

      function codegen(schema, callback) {
        var ast = microast.makeNode(schema);
        ast.export = true;

        var allKnownStructs = {};
        var allKnownLists = {};
        ast.traverse(function(astNode) {
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

        callback(null, ast, output);
      },

      function wrap(ast, output, callback) {
        output.unshift("export jsonTo" + ast.type() + "(json:JSON) : " + ast.type() + " { return _make" + ast.name + "(json) }");
        output.unshift("import vizify.json");
        callback(null, output.join("\n\n"));
      }
    ],

    callback
  );
};
