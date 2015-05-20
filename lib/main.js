'use strict';
/* globals require, module */

var objectAssign = require('object-assign');
var glob = require('glob');

var concat = require('./concat');
var generate = require('./generate');


function JadeDoc(options){

  var settings = objectAssign({
    output: 'jade-doc.json',
    directory: '.',
    keyword: ''
  }, options);

  
  glob(settings.input, function(err, files){
    concat(files, function(store){
      generate(store, settings);
    });
  });

}


module.exports = JadeDoc;