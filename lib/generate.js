'use strict';
/* globals require, module */

var YAML = require('js-yaml');
var objectAssign = require('object-assign');

var collect = require('./collect-comments');
var output = require('./output');


function generate(src, settings){

  var store = {};

  // test if doc is present at all
  if(src.indexOf('//- '+ settings.keyword) === -1){
    return;
  }

  var comments = collect(src, settings.keyword);

  // insert YAML data into store obj
  comments.forEach(function(comment){

    var doc = {
      meta: {
        // file: filePath
      },
      jade: comment
    };

    var json = YAML.safeLoad(comment.comment);
    doc = objectAssign(doc, json);

    // ---
    // generate example
    doc.output = output(doc);


    // ---
    // store data
    var key = doc.name;

    // no value for required name
    if(typeof key === 'undefined'){
      throw new Error('Jade doc error: Required key `name` not found ('+ filePath +')');
    }

    // duplicate key
    if(typeof store[key] !== 'undefined'){
      throw new Error('Jade doc error: Duplicate doc name `'+ doc.name +'` ('+ filePath +')');
    }

    // save document to store
    store[key] = doc;
  });

  console.log(store);
  return store;
}

module.exports = generate;