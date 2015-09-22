'use strict';
/* globals module */


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
    code.push(visitAt(cursor, indent, lines).body);
    code = code.join('\n');
  }

  return code;
}


/**
 * Get code block at line indent
 * returns 
 *   - code block
 *   - line cursor
 */

function visitAt(cursor, indent, lines){
  var i = cursor;
  var block = [];

  while(i++){

    // end of file
    if(typeof lines[i] === 'undefined'){
      break;
    }

    // indent match breaks
    if(lines[i].match(/^\s*/g)[0].length <= indent){
      break;
    }

    block.push(lines[i]);
  }

  return {
    body: block.join('\n'),
    cursor: i
  };
}


module.exports = {
  visitAt: visitAt,
  find: find
};