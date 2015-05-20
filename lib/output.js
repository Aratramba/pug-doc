'use strict';
/* globals require, module */

/**
 * Generates output HTML
 */

var jade = require('jade');

var constants = require('./constants');

function output(doc){
  var extraJade = '';

  // ---
  // Mixin
  if(doc.jade.type === constants.TYPE_MIXIN){
    extraJade = '+'+ doc.jade.root.replace('mixin ', '');

    // check if sample arguments are available
    if(typeof doc.arguments !== 'undefined'){

      // replace arguments with sample values
      for(var key in doc.arguments){
        extraJade = extraJade.replace(key, '\''+ doc.arguments[key]+ '\'');
      }
    }
  }


  // ---
  // Include 
  // simply returns the jade block
  else if(doc.jade.type === constants.TYPE_INCLUDE){
    return '';

  // ---
  // comment
  }else if(doc.jade.type === constants.TYPE_NONE){
    return '';
  }


  // ---
  // Node
  //else if(doc.jade.type === constants.TYPE_NODE){}


  // add example mixin call to source
  var source = doc.jade.block +'\n'+ extraJade;

  // generate html from jade with example call
  return jade.render(source);
}


module.exports = output;