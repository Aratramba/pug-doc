'use strict';
/* globals require, module */

/**
 * Collect comments in Jade source
 *
 * walks through lines
 * if finds `//- @jadedoc` it starts a comment
 * adds lines after this indented more than the starting line
 * stops when indentation is less or equal
 */


var constants = require('./constants');

function collect(source, keyword){

  var comments = [];
  var comment = null;
  var indent;


  // split by line and remove empty string values
  var lines = source.split('\n').filter(function(item){
    return item.trim() !== '';
  });


  // walk through lines
  lines.forEach(function(line, index){


    // ---
    // comment start found
    if(line.indexOf('//- '+ keyword) > -1){
      comment = [];
      indent = line.indexOf('//- '+ keyword);
      return;
    }

    // ---
    // if comment has started
    if(comment !== null){

      // if line indentation is greater than start, add to comment
      if(line.match(/^\s*/g)[0].length > indent){
        comment.push(line);
      }

      // if line indentation doesn't match
      var type = null;
      var next = lines[index];

      // determine type of jade block next to comment
      if(next.indexOf(constants.TYPE_MIXIN) > -1){
        type = constants.TYPE_MIXIN;
      }else if(next.indexOf(constants.TYPE_INCLUDE) > -1){
        type = constants.TYPE_INCLUDE;
      }else if(next.indexOf(constants.TYPE_NODE) > -1){
        type = constants.TYPE_NODE;
      }else{
        type = constants.TYPE_NONE;
      }

      var block = [];
      if(next){

        // collect code block next to comment
        var i = index;
        block = [lines[i]];
        while(lines[i++] && typeof lines[i] !== 'undefined'){
          if(lines[i].match(/^\s*/g)[0].length <= indent){
            break;
          }
          block.push(lines[i]);
        }
      }


      // end
      if(line.match(/^\s*/g)[0].length <= indent || index === lines.length -1){

        // push comment
        comments.push({
          root: line,
          comment: comment.join('\n'),
          block: block.join('\n'),
          type: type
        });

        // reset
        indent = null;
        comment = null;
      }
    }
  });

  return comments;
}

module.exports = collect;