'use strict';
/* globals module, require */

var objectAssign = require('object-assign');

var settings;

function get(){
  return settings;
}

function set(options){
  settings = objectAssign({
    output: 'jade-doc.json',
    directory: '.',
    keyword: '@jadedoc',
    complete: function(){}
  }, options);
  
  return settings;
}

module.exports = {
  get: get,
  set: set
};