'use strict';
/* globals require, module */

var glob = require('glob');

var settings = require('./settings');


function JadeDoc(options){
  settings = settings.set(options);
  
  var concat = require('./concat');
  var generate = require('./generate');

  glob(settings.input, function(err, files){
    concat(files, function(store){
      generate(store, settings);
    });
  });

}


module.exports = JadeDoc;