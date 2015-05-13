'use strict';
/* globals require, module */

var fs = require('fs');
var path = require('path');

var jade = require('jade');
var htmlComments = require('html-comments');
var YAML = require('js-yaml');
var touch = require('touch');
var objectAssign = require('object-assign');
var mkdirp = require('mkdirp');
var glob = require('glob');


// default options
var defaults = {
  outputFile: 'docs.json',
  directory: '.',
  keyword: ''
};

var settings = {};
var store = {};
var num_files;
var counter = 0;



/**
 * Compile a jade file to HTML
 */

function compileJade(source){
  // compile jade
  var fn = jade.compile(source, {});

  // wrap div around jade so the DOM always has a parentNode to look for
  return '<div>' + fn() +'</div>';
}


/**
 * Collect html comments in HTML source
 */

function collectComments(source, keyword){
  return htmlComments.load(source, { 
    keyword: keyword,
    removeKeyword: true
  });
}


/**
 * Parse YAML comments
 */

function parseYAML(comments){
  return comments.map(function(item){
    return YAML.safeLoad(item);
  });
}


/**
 * Convert filepath to dot path
 */

function pathToKey(filePath){

  // remove jade
  var key = filePath.replace('.jade', '');

  // remove first ./
  key = key.replace('./', '');

  // slashes to dots
  key = key.replace(/\//g, '-');

  return key;
}


/**
 * Generate example
 */

function generateExample(fileSource, example, comments){

  // add example mixin call to source
  var source = fileSource +'\n'+ example;

  // generate html from jade with example call
  var html = jade.render(source);

  // remove comments (with comment tags, keyword and breaks)
  comments.forEach(function(comment){
    html = html.replace('<!-- '+ settings.keyword + comment.trim() +'\n-->', '');
  });

  return html;
}


/**
 * Parse file
 */

function parseFile(fileSource, filePath){

  // compile jade to HTML
  var html = compileJade(fileSource);

  // collect comments from HTML
  var comments = collectComments(html, settings.keyword);

  // parse YAML from comments
  var yamls = parseYAML(comments);


  // insert YAML data into store obj
  yamls.forEach(function(yaml, index){

    var doc = {};

    // mix doc with yaml doc
    doc = objectAssign(doc, yaml);

    // check if example is available
    if(typeof yaml.usage !== 'undefined'){

      doc.examples = []

      // generate source and for each jade example push to doc
      if(Array.isArray(yaml.usage)){
        yaml.usage.forEach(function(example){
          doc.examples.push(generateExample(fileSource, example, comments));
        });
      }else{
        doc.examples.push(generateExample(fileSource, yaml.usage, comments));
      }
    }

    // ---
    // store data
    var key = doc.name;

    // no value for required name
    if(typeof key === 'undefined'){

      // TODO: Add file here
      throw new Error('Jade doc error: Required key `name` not found ('+ filePath +')');
    }

    // duplicate key
    if(typeof store[key] !== 'undefined'){
      throw new Error('Jade doc error: Duplicate doc name `'+ doc.name +'` ('+ filePath +')');
    }

    // save document to store
    store[key] = doc;
  });

  complete();
}



/**
 * Complete or next
 */

function complete(){

  if(counter < num_files - 1){
    return counter++;
  }

  // create output dir if it doesn't exist
  mkdirp.sync(path.dirname(settings.outputFile));

  // create docs JSON if it doesn't exist
  touch.sync(settings.outputFile);

  // write file
  fs.writeFile(settings.outputFile, JSON.stringify(store, null, 2));
}


/**
 * Generate docs
 */

function generate(options){

  settings = objectAssign(defaults, options);

  // find all jade files
  glob(options.inputDirectory + '**/*.jade', function(err, files){

    num_files = files.length;

    // loop through jade files
    files.forEach(function(filePath){
      fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data){
        parseFile(data, filePath);
      });
    });
  });
}


module.exports = {
  generate: generate
};