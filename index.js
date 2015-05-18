'use strict';
/* globals require, module */

var fs = require('fs');
var path = require('path');

var jade = require('jade');
// var htmlComments = require('html-comments');
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

var TYPE_NODE = 'node';
var TYPE_MIXIN = 'mixin';
var TYPE_INCLUDE = 'include';


/**
 * Collect comments in Jade source
 *
 * walks through lines
 * if finds `//- @jadedoc` it starts a comment
 * adds lines after this indented more than the starting line
 * stops when indentation is less or equal
 */

function collectComments(source, keyword, filePath){

  var comments = [];
  var comment = null;
  var indent;
  var next;


  // split by line and remove empty string values
  var lines = source.split('\n').filter(function(item){
    return item.trim() !== '';
  });

  // walk through lines
  lines.forEach(function(line, index){

    // ---
    // comment start found
    if(line.indexOf('//- '+ keyword) > -1){
      comment = [];
      indent = line.indexOf('//- '+ keyword);
      return;
    }

    // ---
    // if comment has started
    if(comment !== null){

      next = lines[index];

      // and line matches indentation
      if(line.match(/^\s*/g)[0].length > indent){

        // add comment line
        return comment.push(line);
      }


      // ---
      // if indentation doesn't match

      var type = null;

      if(next.indexOf(TYPE_MIXIN) > -1){
        type = TYPE_MIXIN;
      }

      else if(next.indexOf(TYPE_INCLUDE) > -1){
        type = TYPE_INCLUDE;
      }

      else if(next.indexOf(TYPE_NODE) > -1){
        type = TYPE_NODE;
      }


      // ---
      // collect code block
      
      var i = index;
      var block = [lines[i]];
      while(lines[i++] && typeof lines[i] !== 'undefined'){
        if(lines[i].match(/^\s*/g)[0].length <= indent){
          break;
        }
        block.push(lines[i]);
      }

      // push comment
      comments.push({
        root: line,
        comment: comment.join('\n'),
        block: block.join('\n'),
        type: type
      });

      // reset
      indent = null;
      comment = null;
    }
  });

  return comments;
}


/**
 * Generate output HTML
 */

function output(doc){
  var extraJade = '';

  // ---
  // Mixin
  if(doc.jade.type === TYPE_MIXIN){

    // check if sample arguments are available
    if(typeof doc.arguments !== 'undefined'){
      extraJade = '+'+ doc.jade.root.replace('mixin ', '');

      // replace arguments with sample values
      for(var key in doc.arguments){
        extraJade = extraJade.replace(key, "'"+ doc.arguments[key]+ "'");
      }
    }
  }


  // ---
  // Include 
  // simply returns the jade block
  else if(doc.jade.type === TYPE_INCLUDE){
    return doc.jade.block;
  }


  // ---
  // Node
  else if(doc.jade.type === TYPE_NODE){

  }


  // add example mixin call to source
  var source = doc.jade.block +'\n'+ extraJade;

  // generate html from jade with example call
  return jade.render(source);
}


/**
 * Parse file
 */

function parseFile(fileSource, filePath){

  // test if doc is present at all
  if(fileSource.indexOf('//- '+ settings.keyword) === -1){
    return done();
  }

  var comments = collectComments(fileSource, settings.keyword, filePath);

  // insert YAML data into store obj
  comments.forEach(function(comment){

    var doc = {
      meta: {
        file: filePath
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

  done();
}



/**
 * done or next
 */

function done(){

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
  glob(options.input, function(err, files){

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