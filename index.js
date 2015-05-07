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



/**
 * Compile a jade file to HTML
 */

function compileJade(filePath){
  // compile jade
  var fn = jade.compileFile(filePath, {});

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
  key = key.replace(/\//g, '.');

  return key;
}


/**
 * Generate docs
 */

function generate(options){

  options = objectAssign(defaults, options);

  // find all jade files
  glob(options.inputDirectory + '**/*.jade', function(err, files){

    // store docs
    var store = {};

    // loop through jade files
    files.forEach(function(filePath){

      // compile jade to HTML
      var html = compileJade(filePath);

      // collect comments from HTML
      var comments = collectComments(html, options.keyword);

      // parse YAML from comments
      var yamls = parseYAML(comments);

      // insert YAML data into store obj
      yamls.forEach(function(yaml){
        store[pathToKey(filePath)] = yaml;
      });
    });

    // create output dir if it doesn't exist
    mkdirp(path.dirname(options.outputFile));

    // create docs JSON if it doesn't exist
    touch(options.outputFile);

    // write file
    fs.writeFile(options.outputFile, JSON.stringify(store, null, 2));
  });

}


module.exports = {
  generate: generate
};