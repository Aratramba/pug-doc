'use strict';
/* global require, module */

var jade = require('jade');
var jadeRuntime = require('jade-runtime');
var path = require('path');
var YAML = require('js-yaml');
var getCodeBlock = require('jade-code-block');
var jadedocArguments = require('./arguments');

var MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
var JADEDOC_REGEX = /^\s*\/\/-\s+?\@jadedoc\s*$/;


/**
 * Returns all jadedoc comment and code blocks for the given code
 *
 * @param templateSrc {string}
 * @return {{lineNumber: number, comment: string, code: string}[]}
 */

function extractJadedocBlocks(templateSrc){
  return templateSrc
    .split('\n')
    // Walk through every line and look for a jadedoc comment
    .map(function(line, lineIndex){
      // If the line does not contain a jadedoc comment skip it
      if (!line.match(JADEDOC_REGEX)){
        return undefined;
      }
      // If the line contains a jadedoc comment return
      // the comment block and the next code block
      var comment = getCodeBlock.byLine(templateSrc, lineIndex + 1);
      var code = getCodeBlock.afterBlockAtLine(templateSrc, lineIndex + 1);

      // if no code and no comment, skip
      if(comment.match(JADEDOC_REGEX) && code === ''){
        return undefined;
      }

      return {
        lineNumber: lineIndex + 1,
        comment: comment,
        code: code
      };
    })
    // Remove skiped lines
    .filter(function(result){
      return result !== undefined;
    });
}


/**
 * Returns all jadedocDocuments for the given code
 *
 * @param templateSrc {string}
 * @param filename {string}
 */

function getJadedocDocuments(templateSrc, filename){
  return extractJadedocBlocks(templateSrc)
    .map(function(jadedocBlock) {
      var meta = parseJadedocComment(jadedocBlock.comment);

      // parse jsdoc style arguments list
      if(meta.arguments){
        meta.arguments = meta.arguments.map(function(arg){
          return jadedocArguments.parse(arg);
        });
      }

      return {
        // get meta
        meta: meta,
        // add file path
        file: path.relative('.', filename),
        // get jade code block matching the comments indent
        source: jadedocBlock.code,
        // get html output
        output: compileJade(jadedocBlock.code, meta, filename)
      };
    });
}


/**
 * Extract jade attributes from comment block
 */

function parseJadedocComment(comment){

  // remove first line (@jadedoc)
  if(comment.indexOf('\n') === -1){
    return {};
  }

  comment = comment.substr(comment.indexOf('\n'));
  comment = jadedocArguments.escapeArgumentsYAML(comment);

  // parse YAML
  return YAML.safeLoad(comment) || {};
}


/**
 * insert value into an array
 * insert can be a string, which will be pushed
 * insert can be an array, which will be merged 
 */

function insertIntoArray(arr, insert){
  if(Array.isArray(insert)){
    arr = arr.concat(insert);
  }else if(typeof insert === 'string'){
    if(insert.trim() !== ''){
      arr.push(insert);
    }
  }
  return arr;
}


/**
 * get all examples from the meta object
 * either one or both of meta.example and meta.examples can be given
 */

function getExamples(meta){
  var examples = [];
  examples = insertIntoArray(examples, meta.example);
  examples = insertIntoArray(examples, meta.examples);
  return examples;
}


/**
 * Compile Jade
 */

function compileJade(src, meta, filename){

  // add example calls
  getExamples(meta).forEach(function(example){

    // only append to jade if it's a mixin example
    if(MIXIN_NAME_REGEX.test(src)){
      src += '\n'+ example;
    }
  });

  // compile jade
  var compiled = jade.compileClientWithDependenciesTracked(src, { filename: filename });
  // render jade function
  return Function('jade', compiled.body + '\n' +'return template('+ JSON.stringify(meta.locals || {}) +');')(jadeRuntime);
}


// Exports
module.exports = {
  extractJadedocBlocks: extractJadedocBlocks,
  getJadedocDocuments: getJadedocDocuments,
  parseJadedocComment: parseJadedocComment,
  insertIntoArray: insertIntoArray,
  getExamples: getExamples
};