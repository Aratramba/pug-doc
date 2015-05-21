'use strict';
/* globals require, module */

/**
 * Generates output HTML
 */

var jade = require('jade');

var constants = require('./constants');

function output(doc){
  var extraJade = [];
  

  // ---
  // Mixin
  if(doc.jade.type === constants.TYPE_MIXIN){

    if(doc.jade.dependencies){
      extraJade.push(doc.jade.dependencies.join('\n'));
    }

    // add mixin call
    var call = '+'+ doc.jade.root.replace('mixin ', '');

    // check if sample arguments are available
    if(typeof doc.arguments !== 'undefined'){

      // replace arguments with sample values
      for(var key in doc.arguments){
        call = call.replace(key, '\''+ doc.arguments[key]+ '\'');
      }
    }

    extraJade.push(call);
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
  var source = doc.jade.code +'\n'+ extraJade.join('\n');

  // generate html from jade with example call
  return jade.render(source);
}


module.exports = output;