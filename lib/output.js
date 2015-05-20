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

// function done(){

//   if(counter < num_files - 1){
//     return counter++;
//   }

//   // create output dir if it doesn't exist
//   mkdirp.sync(path.dirname(settings.output));

//   // create docs JSON if it doesn't exist
//   touch.sync(settings.output);

//   // write file
//   fs.writeFile(settings.output, JSON.stringify(store, null, 2), complete);
// }


// /**
//  * Complete
//  */

// function complete(err){
//   if(err) throw err;
//   console.log('Jade doc complete');

//   if(cb){
//     cb();
//   }
// }