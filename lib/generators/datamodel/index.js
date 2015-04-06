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
        ast.traverseStructs(function(obj) {
          allKnownStructs[obj.name] = obj;
        });

        var output = Object.values(allKnownStructs)
          .map(function(obj) {
            return obj.generate();
          });

        callback(null, ast, output);
      },

      function wrap(ast, output, callback) {
        output.unshift("import vizify.json");
        output.push("export jsonTo" + ast.name + "(json:JSON) : " + ast.name + " { return _make" + ast.name + "(json) }");
        callback(null, output.join("\n\n"));
      }
    ],

    callback
  );
};
