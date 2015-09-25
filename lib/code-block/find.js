'use strict';
/* globals module, require */

var codeBlockAtIndent = require('./at-indent');


/**
 * Find part of string in lines, and get code block after it
 * 
 * i.e
 * > mixin foo
 * >  | faa
 *
 * find('mixin foo', […])
 */

function find(substr, lines){
  var i = 0;
  var l = lines.length;
  var cursor = null;
  var code = null;

  // find line
  for(; i<l; ++i){
    if(lines[i].indexOf(substr) > -1){
      cursor = i;
      break;
    }
  }

  // find code block
  if(cursor !== null){
    code = [lines[cursor]];
    var indent = lines[cursor].match(/^\s*/g)[0].length;
    code.push(codeBlockAtIndent(cursor, indent, lines).body);
    code = code.join('\n');
  }

  return code;
}

module.exports = find;