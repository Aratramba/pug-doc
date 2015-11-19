'use strict';
/* global require, module */

var doctrine = require('doctrine');
var doctrineSyntax = doctrine.Syntax;
var codeBlock = require('jade-code-block');


var TYPE_MAPPING = {};
TYPE_MAPPING[doctrineSyntax.RecordType] = 'Object';

/**
 * Get JSDoc type
 */

function getJSDocType(tag){
  var type = tag.type;

  if(type){

    if(type.elements){
      return type.elements.map(function(item){
        return item.name;
      });
    }

    if(type.name){
      return type.name;
    }

    if(type.expression){
      return type.expression.name;
    }

    if(type.type){
      return TYPE_MAPPING[type.type] || type.type;
    }

    return type;
  }

  return '';
}


/**
 * Check if param is nullable
 */

function getJSDocNullable(tag){
  if(tag && tag.type && tag.type.type){
    return (tag.type.type === doctrineSyntax.NullableType);
  }
  return false;
}


/**
 * Check if param is optional
 */

function getJSDocOptional(tag){
  if(tag && tag.type && tag.type.type){
    return (tag.type.type === doctrineSyntax.OptionalType);
  }
  return false;
}


/**
 * Parse param string
 */

function parseJSDocParam(str){
  var tag = getJSDocParamAst(str);

  if(!tag){
    return null;
  }

  var param = {
    name: tag.name || '',
    description: tag.description || '',
    type: getJSDocType(tag),
    default: tag.default || null,
    nullable: getJSDocNullable(tag),
    optional: getJSDocOptional(tag)
  };

  return param;
}


/**
 * Get JSDoc param ast by parsing '* param ...' with doctrine
 */

function getJSDocParamAst(str){
  var ast = doctrine.parse('* @param '+ str, { unwrap: true, tags: ['param'], sloppy: true });
  
  if(!ast.tags.length){
    return null;
  }

  return ast.tags[0];
}


/**
 * Wrap arguments list items in quotes to be able
 * to use jsdoc like `{type} foo - foo`. 
 * The {} are special yaml characters so the
 * jsdoc string needs to be escaped with quotes.
 */

function escapeArgumentsYAML(str){
  var argsBlock = codeBlock.byString(str, 'arguments:');
  var escapedArgsBlock = argsBlock.replace(/([\s].-[\s+]?)(.*)/gi, '$1"$2"');
  str = str.replace(argsBlock, escapedArgsBlock);
  return str;
}

module.exports = {
  getType: getJSDocType,
  isOptional: getJSDocOptional,
  isNullable: getJSDocNullable,
  parse: parseJSDocParam,
  getAst: getJSDocParamAst,
  escapeArgumentsYAML: escapeArgumentsYAML
};