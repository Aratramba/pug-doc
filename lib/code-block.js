'use strict';
/* globals require, module */


/**
 * Get code block at line indent
 * returns 
 *   - code block
 *   - line cursor
 */

function getCodeBlock(cursor, indent, lines){
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


module.exports = getCodeBlock;