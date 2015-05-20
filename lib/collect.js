'use strict';
/* globals require, module */

/**
 * Collect comments in Jade src
 *
 * walks through lines
 * if finds `//- @jadedoc` it starts a comment
 * adds lines after this indented more than the starting line
 * stops when indentation is less or equal
 */


var constants = require('./constants');
var settings = require('./settings').get();

var lines;


/**
 * Get file
 */

function getFile(file, line){
  var flag = '//- '+ settings.keyword +'-file';
  if(line.trim().indexOf(flag) === 0){
    file = line.replace(flag, '').trim().replace(/\'/g, '');
  }
  return file;
}


/**
 * Get jade content type
 */

function getType(str){

  var type = constants.TYPE_NONE;

  if(!str){
    return type;
  }

  // determine type of jade block next to comment
  if(str.indexOf(constants.TYPE_MIXIN) > -1){
    type = constants.TYPE_MIXIN;
  }else if(str.indexOf(constants.TYPE_INCLUDE) > -1){
    type = constants.TYPE_INCLUDE;
  }else if(str.indexOf(constants.TYPE_NODE) > -1){
    type = constants.TYPE_NODE;
  }else{
    type = constants.TYPE_NONE;
  }
  return type;
}


/**
 * Get comment
 */

function getComment(line, cursor){

  var flag = '//- '+ settings.keyword;

  // find indent at flag
  if(line.trim().indexOf(flag) === 0 && line.trim().length === flag.length){
    var indent = line.indexOf(flag);

    // get comment body 
    var comment = getIndentedBlock(cursor, indent);

    // get code block
    var root = lines[comment.cursor];
    var code = [root];
    code.push(getIndentedBlock(comment.cursor, indent).body);

    var type = getType(root);

    return {
      body: comment.body,
      code: code.join('\n'),
      indent: indent,
      type: getType(root),
      root: root
    };
  }

  return null;
}


/**
 * Get code block at line indent
 * returns 
 *   - code block
 *   - line cursor
 */

function getIndentedBlock(cursor, indent){
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


/**
 * Collect all comments
 */


function collect(src, keyword){

  var comments = [];
  var comment = null;
  var indent = null;
  var file = null;


  // split by line and remove empty string values
  lines = src.split('\n').filter(function(item){
    return item.trim() !== '';
  });

  // walk through lines
  lines.forEach(function(line, index){

    file = getFile(file, line);
    comment = getComment(line, index);

    if(comment){
      comment.file = file;

      // push comment
      comments.push(comment);
    }
  });

  return comments;
}

module.exports = collect;