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
var codeBlock = require('./code-block');
var flatten = require('array-flatten');
var unique = require('array-uniq');

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

  var TYPES = [
    'TYPE_MIXIN', 
    'TYPE_INCLUDE', 
    'TYPE_NODE', 
    'TYPE_EXTENDS', 
    'TYPE_BLOCK_REGEX', 
    'TYPE_BLOCK_APPEND_REGEX', 
    'TYPE_BLOCK_PREPEND_REGEX'
  ];
  
  var t, c;
  for(t in TYPES){
    c = constants[TYPES[t]];
    if(str.indexOf(c) > -1){
      return c;
    }
  }

  return constants.TYPE_NONE;
}


/**
 * Find mixin dependencies
 */

function findDependencies(code){
  var dependencies = null;

  // find mixin dependencies
  if(constants.MIXIN_CALL_REGEX.test(code)){
    dependencies = [];
    var mixins = code.match(constants.MIXIN_CALL_REGEX);
    mixins.forEach(function(mixin){
      var key = mixin.replace('+', '');
      var dep = codeBlock.find('mixin '+ key, lines);
      if(dep){
        dependencies.push(dep);

        // recurse into dependencies
        var more = findDependencies(dep);
        if(more){
          dependencies.push(more);
        }
      }
    });
  }

  return dependencies;
}


/**
 * Get comment
 */

function getComment(line, cursor){

  var flag = '//- '+ settings.keyword;

  var obj = {};

  // find indent at flag
  if(line.trim().indexOf(flag) === 0 && line.trim().length === flag.length){
    var indent = line.indexOf(flag);

    // get comment body 
    var comment = codeBlock.visitAt(cursor, indent, lines);

    // get code block
    var root = lines[comment.cursor];

    obj.comment = comment.body;
    obj.type = getType(root);
    obj.indent = indent;

    // if code block was found
    if(root){
      obj.root = root;

      // add rest of code block to code block root
      var code = [root];
      code.push(codeBlock.visitAt(comment.cursor, indent, lines).body);
      obj.code = code.join('\n');

      // find dependencies
      var dependencies = findDependencies(obj.code);
      if(dependencies){
        obj.dependencies = flatten(dependencies);
        obj.dependencies = unique(obj.dependencies);
      }
    }
    return obj;
  }

  return null;
}


/**
 * Collect all comments
 */

function collect(src){

  var comments = [];
  var comment = null;
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