var acorn = require('acorn')
  , esmangle = require('esmangle')
  , escodegen = require('escodegen')
  ;

module.exports = function(js) {
  var ast = acorn.parse(js, {});
  var optimized = esmangle.optimize(ast, {
    destructive: false,
    topLevelContext: 'window'
  });
  var mangled = esmangle.mangle(optimized);
  var result = escodegen.generate(mangled, {
    format: {
      compact: true
    }
  });

  return result;
};
