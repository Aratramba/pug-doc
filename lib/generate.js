'use strict';
/* globals require, module, console */

var fs = require('fs');
var path = require('path');
var touch = require('touch');
var mkdirp = require('mkdirp');

var YAML = require('js-yaml');
var objectAssign = require('object-assign');

var collect = require('./collect');
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
      throw new Error('Jade doc error: Required key `name` not found, '+ comment.comment);
    }

    // duplicate key
    if(typeof store[key] !== 'undefined'){
      throw new Error('Jade doc error: Duplicate doc name `'+ doc.name);
    }

    // save document to store
    store[key] = doc;
  });

  complete(store, settings);
  return store;
}

function complete(store, settings){

  // create output dir if it doesn't exist
  mkdirp.sync(path.dirname(settings.output));

  // create docs JSON if it doesn't exist
  touch.sync(settings.output);

  // write file
  fs.writeFile(settings.output, JSON.stringify(store, null, 2), function(err){
    if(err) throw err;
    console.log('Jade doc complete');
  });
}

module.exports = generate;