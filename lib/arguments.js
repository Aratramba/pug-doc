'use strict';
/* global require, module */

var doctrine = require('doctrine');
var doctrineSyntax = doctrine.Syntax;


var TYPE_MAPPING = {};
TYPE_MAPPING[doctrineSyntax.RecordType] = 'Object';

/**
 * Get jsdoc type
 */

function getJsdocType(tag){
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

function getJsdocNullable(tag){
  if(tag && tag.type && tag.type.type){
    return (tag.type.type === doctrineSyntax.NullableType);
  }
  return false;
}


/**
 * Check if param is optional
 */

function getJsdocOptional(tag){
  if(tag && tag.type && tag.type.type){
    return (tag.type.type === doctrineSyntax.OptionalType);
  }
  return false;
}


/**
 * Parse param string
 */

function parseJsdocParam(str){
  var tag = getJsdocParamAst(str);

  if(!tag){
    return null;
  }

  var param = {
    name: tag.name || '',
    description: tag.description || '',
    type: getJsdocType(tag),
    default: tag.default || null,
    nullable: getJsdocNullable(tag),
    optional: getJsdocOptional(tag)
  };

  return param;
}


/**
 * Get jsdoc param ast by parsing '* param ...' with doctrine
 */

function getJsdocParamAst(str){
  var ast = doctrine.parse('* @param '+ str, { unwrap: true, tags: ['param'], sloppy: true });
  
  if(!ast.tags.length){
    return null;
  }

  return ast.tags[0];
}


module.exports = {
  getType: getJsdocType,
  isOptional: getJsdocOptional,
  isNullable: getJsdocNullable,
  parse: parseJsdocParam,
  getAst: getJsdocParamAst
};