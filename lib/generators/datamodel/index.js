var async = require('async')
  , validator = require('is-my-json-valid')
  , jsonSchema = require('../../../static/json-schema.json')
  , microast = require('./microast')
  ;


var validate = function validate(schema, callback) {
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
};

/**
 * Ensure all "object" types in the schema has a title. If it doesn't, we will autogenerate one.
 * @param schema
 * @param callback
 */
var ensureObjectsHaveTitles = function ensureObjectsHaveTitles(schema, callback) {
  var definitions = schema.definitions;
  var anonymousStructCount = 0;

  function ensureTitles(obj) {
    if (!obj) {
      return;
    }
    if (obj.type === "object" && !obj.title) {
      obj.title = "Data" + anonymousStructCount;
      anonymousStructCount++;
    }
    if (obj.type === "object") {
      obj.properties = obj.properties || {};
      Object.values(obj.properties).each(ensureTitles);
    } else if (obj.type === "array") {
      ensureTitles(obj.items);
    }
  }

  ensureTitles(schema);
  if (definitions) {
    Object.values(definitions).each(ensureTitles);
  }

  callback(null, schema);
};


/**
 * Replace any "$ref" references in the JSON schema with the actual referent.
 * @param schema
 * @param callback
 */
var resolveReferencesInSchema = function resolveReferencesInSchema(schema, callback) {
  var definitions = schema.definitions;
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
};


/**
 * Generates actual virgil code from the schema.
 * @param schema
 * @param callback
 */
var generateVirgilCode = function generateVirgilCode(schema, callback) {
  var rootAstNode = microast.makeNode(schema);
  rootAstNode.export = true;

  // Compile a registry of all virgil Structs and list<'T>s in the AST.
  var allKnownStructs = {};
  var allKnownLists = {};
  rootAstNode.traverse(function(astNode) {
    if (astNode instanceof microast.Struct) {
      allKnownStructs[astNode.name] = astNode;
    } else if (astNode instanceof microast.List) {
      allKnownLists[astNode.name] = astNode;
    }
  });

  // For each struct, generate its definition and a maker function.
  var structOutput = Object.values(allKnownStructs)
    .map(function(obj) {
      return obj.generate() + "\n" + obj.generateMakerFunction();
    })
    .join("\n\n");

  // For each list, generate a maker function.
  var listOutput = Object.values(allKnownLists).map(
    function(list) {
      return list.generateMakerFunction();
    })
    .join("\n\n");

  // Smash them together and see what we get
  var finalOutput = structOutput + "\n\n" + listOutput;

  callback(null, finalOutput);
};


/**
 * Generates the final output by importing vizify.json and exporting a maker function.
 * @param output
 * @param callback
 */
var wrap = function wrap(output, callback) {
  var wrappedOutput = "import vizify.json\n\n" +
                      output;
  callback(null, wrappedOutput);
};


/**
 * Given a schema, generates virgil code that will parse JSON that matches that schema into a virgil struct.
 * @param schema
 * @param callback
 */
module.exports = function generateDataModel(schema, callback) {
  async.waterfall(
    [
      validate.bind(null, schema),
      ensureObjectsHaveTitles,
      resolveReferencesInSchema,
      generateVirgilCode,
      wrap
    ],
    callback
  );
};
