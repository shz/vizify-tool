CodeMirror.defineMode('vgl', function(cmConfig, modeConfig) {
  ////////////////////////////////////
  // CRIBBED FROM VIRGIL TOKENIZER

  var re = [];

  // Keywords
  [ 'true'
  , 'false'
  , 'if'
  , 'else'
  , 'function'
  , 'method'
  // , 'animation'
  // , 'renderer'
  , 'struct'
  , 'return'
  , 'struct'
  , 'while'
  , 'for'
  , 'upto'
  , 'downto'
  , 'break'
  , 'continue'
  , 'try'
  , 'catch'
  , 'export'
  , 'import'
  , 'lambda'
  , 'null'
  , 'void'
  , 'extern'
  , 'new'
  , 'default'
  ].forEach(function(keyword) {
    re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
  });

  // Everything else
  re = re.concat([ [/\d+(?:\.\d+f?|f)/, 'float']
                 , [/\d+/, 'int']
                 , [/\d+px/, 'px']
                 , [/"[^\\"\r\n]*(?:\\.[^"\\]*)*"/, 'string']

                 // Variable declarations

                 , [/\blet(?:!|\b)/, 'let']
                 , [/\bout(?:!|\b)/, 'out']
                 , [/\bmut(?:!|\b)/, 'mut']

                 // Identifiers

                 , [/\b[a-zA-Z0-9_]+\b/, 'identifier']

                 // Generics

                 , [/'[A-Z]/, 'gref'] // Syntax highlighter fix -> '

                 // Arithmetic

                 , ['**', '**']
                 , ['*', '*']
                 , ['/', '/']
                 , ['+', '+']
                 , ['-', '-']
                 , ['%', '%']

                 // Logic

                 , ['!=', '!=']
                 , ['!', '!']
                 , ['>=', '>=']
                 , ['<=', '<=']
                 , ['&&', '&&']
                 , ['||', '||']
                 , ['<', '<']
                 , ['>', '>']
                 , ['==', '==']

                 // Bitwise

                 , ['&', '&']
                 , ['|', '|']

                 // Comments

                 , [/\#.*/, 'comment']

                 // Everything else

                 , ['=', '=']
                 , ['(', '(']
                 , [')', ')']
                 , ['?', '?']
                 , [',', ',']
                 , [':', ':']
                 , ['{', '{']
                 , ['}', '}']
                 , ['[', '[']
                 , [']', ']']
                 , ['.', '.']
                 , [';', ';']
                 , [/\s+/, 'whitespace']

                 // Everything else raises a tokenizer error

                 , [/[\S]+/, '_err']
                 ]);


  // Combine the various syntax components into one grand regex to
  // rule them all.
  var source = re.map(function(r) {
    var s = null;
    if (r[0] instanceof RegExp)
      s = r[0].source;
    else
      s = r[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    return '(' + s + ')';
  }).join('|');

  var regex = new RegExp(source);

  // END CRIBBING
  ///////////////////////////////////////

  var map = function(t, state) {
    if (!t) {
      return null;
    }

    if (t == 'identifier') {
      if (state.inPropAccess)
        return 'property';
      if (state.inFunctionDef)
        return 'variable-2';
    }

    var m = {
      '{': 'bracket',
      '}': 'bracket',
      '(': 'bracket',
      ')': 'bracket',
      '>': 'bracket',
      '<': 'bracket',
      'float': 'number',
      'int': 'number',
      'string': 'string',
      'identifier': null,
      'export': 'qualifier',
      'import': 'qualifier',
      'extern': 'qualifier',
      'func': 'builtin',
      'int': 'builtin',
      'float': 'builtin',
      'list': 'builtin',
      'default': 'builtin',
      'let': 'def',
      'mut': 'def',
      'struct': 'def',
      '_err': 'err',
      'gref': 'variable-3',
      'function': 'def',
      'method': 'def',
      'whitespace': null
    };

    if (m[t] !== undefined) {
      return m[t];
    }

    if (t.match(/^[a-z]+$/)) {
      return 'keyword';
    }

    return t;
  };

  return {
    lineComment: '#',
    electricChars: '{}',

    startState: function() {
      return {
        indentLevel: 0,
        inPropAccess: false,
        inFunctionDef: false
      };
    },

    token: function(stream, state) {
      var m = stream.match(regex);
      var type = null;

      for (var i=1; i<re.length; i++) {
        if (m[i]) {
          type = re[i-1][1];
          break;
        }
      }

      // Hack around identifiers
      if (type == 'identifier') {
        switch (m[0]) {
          case 'int':
            type = 'int';
            break;
          case 'float':
            type = 'float';
            break;
          case 'list':
            type = 'list';
            break;
        }
      }

      var mapped = map(type, state);

      if (type != 'whitespace') {
        state.inPropAccess = false;
        state.inFunctionDef = false;
      }
      switch (type) {
        case '{':
          state.indentLevel++;
          break;
        case '}':
          state.indentLevel--;
          break;
        case '.':
          state.inPropAccess = true;
          break;
        case 'method':
        case 'function':
          state.inFunctionDef = true;
          break;
      }

      return mapped;
    },

    indent: function(state, textAfter) {
      var level = state.indentLevel;
      if (textAfter.match(/}/))
        level--;

      return level * cmConfig.indentUnit;
    }
  };
});

CodeMirror.defineMIME('text/virgil', 'vgl');
