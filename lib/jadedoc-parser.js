'use strict';
var jade = require('jade');
var jadeRuntime = require('jade-runtime');
var path = require('path');
var YAML = require('js-yaml');
var getCodeBlock = require('jade-code-block');

var MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
var JADEDOC_REGEX = /^\s*\/\/-\s+?\@jadedoc\s*$/;

/**
 * Returns all jadedoc comment and code blocks for the given code
 *
 * @param templateSrc {string}
 * @return {{lineNumber: number, comment: string, code: string}[]}
 */
function extractJadedocBlocks (templateSrc){
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
      return {
        lineNumber: lineIndex + 1,
        comment: getCodeBlock.byLine(templateSrc, lineIndex + 1),
        code: getCodeBlock.afterBlockAtLine(templateSrc, lineIndex + 1)
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
  comment = comment.substr(comment.indexOf('\n'));
  // parse YAML
  return YAML.safeLoad(comment);
}


/**
 * Compile Jade
 */
function compileJade(src, meta, filename){
  // add mixin call to mixin
  if(MIXIN_NAME_REGEX.test(src)){
    src += '\n+'+ src.match(MIXIN_NAME_REGEX)[1];

    if(meta.arguments){
      var args = [];
      var arg;

      for(arg in meta.arguments){
        args.push(JSON.stringify(meta.arguments[arg]));
      }

      src += '('+ args.join(',') +')';
    }
  }
  // compile jade
  var compiled = jade.compileClientWithDependenciesTracked(src, { filename: filename });
  // render jade function
  return Function('jade', compiled.body + '\n' +'return template('+ JSON.stringify(meta.locals || {}) +');')(jadeRuntime);
}


// Exports
module.exports.extractJadedocBlocks = extractJadedocBlocks;
module.exports.getJadedocDocuments = getJadedocDocuments;
module.exports.parseJadedocComment = parseJadedocComment;