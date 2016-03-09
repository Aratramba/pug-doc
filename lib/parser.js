'use strict';
/* global require, module */

var pug = require('pug');
var pugRuntime = require('pug-runtime');

var path = require('path');
var YAML = require('js-yaml');
var getCodeBlock = require('pug-code-block');
var pugdocArguments = require('./arguments');

var MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
var DOC_REGEX = /^\s*\/\/-\s+?\@pugdoc\s*$/;



/**
 * Returns all pugdoc comment and code blocks for the given code
 *
 * @param templateSrc {string}
 * @return {{lineNumber: number, comment: string, code: string}[]}
 */

function extractPugdocBlocks(templateSrc){
  return templateSrc
    .split('\n')
    // Walk through every line and look for a pugdoc comment
    .map(function(line, lineIndex){
      // If the line does not contain a pugdoc comment skip it
      if (!line.match(DOC_REGEX)){
        return undefined;
      }
      // If the line contains a pugdoc comment return
      // the comment block and the next code block
      var comment = getCodeBlock.byLine(templateSrc, lineIndex + 1);
      var code = getCodeBlock.afterBlockAtLine(templateSrc, lineIndex + 1);
      code = getCodeBlock.normalize(code);

      // if no code and no comment, skip
      if(comment.match(DOC_REGEX) && code === ''){
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
 * Returns all pugdocDocuments for the given code
 *
 * @param templateSrc {string}
 * @param filename {string}
 */

function getPugdocDocuments(templateSrc, filename, globals){
  return extractPugdocBlocks(templateSrc)
    .map(function(pugdocBlock) {
      var meta = parsePugdocComment(pugdocBlock.comment);

      // parse jsdoc style arguments list
      if(meta.arguments){
        meta.arguments = meta.arguments.map(function(arg){
          return pugdocArguments.parse(arg, true);
        });
      }

      // parse jsdoc style attributes list
      if(meta.attributes){
        meta.attributes = meta.attributes.map(function(arg){
          return pugdocArguments.parse(arg, true);
        });
      }

      var source = pugdocBlock.code;
      source = source.replace(/\u2028|\u200B/g,'');

      return {
        // get meta
        meta: meta,
        // add file path
        file: path.relative('.', filename),
        // get pug code block matching the comments indent
        source: source,
        // get html output
        output: compilePug(source, meta, filename, globals)
      };
    });
}


/**
 * Extract pug attributes from comment block
 */

function parsePugdocComment(comment){

  // remove first line (@pugdoc)
  if(comment.indexOf('\n') === -1){
    return {};
  }

  comment = comment.substr(comment.indexOf('\n'));
  comment = pugdocArguments.escapeArgumentsYAML(comment, 'arguments');
  comment = pugdocArguments.escapeArgumentsYAML(comment, 'attributes');

  // parse YAML
  return YAML.safeLoad(comment) || {};
}


/**
 * get all examples from the meta object
 * either one or both of meta.example and meta.examples can be given
 */

function getExamples(meta){
  var examples = [];
  if(meta.example){
    examples = examples.concat(meta.example);
  }
  if(meta.examples){
    examples = examples.concat(meta.examples);
  }
  return examples;
}


/**
 * Compile Pug
 */

function compilePug(src, meta, filename, globals){

  // add example calls
  getExamples(meta).forEach(function(example){

    // only append to pug if it's a mixin example
    if(MIXIN_NAME_REGEX.test(src)){
      src += '\n'+ example;
    }
  });

  var locals = Object.assign({}, globals, meta.locals);

  // compile pug
  var compiled = pug.compileClient(src, { filename: filename });

  // render pug function
  return Function('pug', compiled + '\n' +'return template('+ JSON.stringify(locals || {}) +');')(pugRuntime);
}


// Exports
module.exports = {
  extractPugdocBlocks: extractPugdocBlocks,
  getPugdocDocuments: getPugdocDocuments,
  parsePugdocComment: parsePugdocComment,
  getExamples: getExamples
};