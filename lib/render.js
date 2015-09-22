'use strict';
/* globals require, module */

/**
 * Generates output HTML
 */

var jade = require('jade');

var constants = require('./constants');


/**
 * Generate output
 */

function output(doc){

  // no html output for following mixins
  switch(doc.jade.type){
    case constants.TYPES.INCLUDE.label:
    case constants.TYPES.EXTENDS.label:
    case constants.TYPES.BLOCK.label:
    case constants.TYPES.APPEND.label:
    case constants.TYPES.PREPEND.label:
    case constants.TYPES.COMMENT.label:
    case constants.TYPES.EMPTY_LINE.label:
      return '';
  }

  var source = doc.jade.code;

  // add mixin call
  if(doc.jade.type === constants.TYPES.MIXIN.label){
    source += '\n'+ renderMixin(doc);
  }

  // generate html from jade with example call
  return jade.render(source, { pretty: true });
}


/**
 * Generate mixin output
 */

 function renderMixin(doc){

  var append = [];

  if(doc.jade.dependencies){
    append.push(doc.jade.dependencies.join('\n'));
  }

  // add mixin call `+mixin`
  var call = '+'+ doc.jade.root.replace('mixin ', '');

  // check if sample arguments are available `+mixin(foo, faa)`
  if(typeof doc.arguments !== 'undefined'){

    // replace arguments with sample values
    for(var key in doc.arguments){
      call = call.replace(key, '\''+ doc.arguments[key]+ '\'');
    }
  }

  append.push(call);

  return append.join('\n');
 }


module.exports = output;