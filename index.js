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

var TYPE_STRING = 'string';
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

function collectComments(source, keyword){

  var comments = [];
  var comment = null;
  var indent;
  var next;
  var type;

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

      type = TYPE_STRING;
      if(next.indexOf(TYPE_MIXIN) > -1){
        type = TYPE_MIXIN;
      }

      if(next.indexOf(TYPE_INCLUDE) > -1){
        type = TYPE_INCLUDE;
      }

      // push comment
      comments.push({
        yaml: comment.join('\n'),
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
 * Parse YAML comments
 */

function parseYAML(comments){
  return comments.map(function(item){
    item.json = YAML.safeLoad(item.yaml);
    return item;
  });
}


/**
 * Generate example
 */

function generateExample(fileSource, example){

  // add example mixin call to source
  var source = fileSource +'\n'+ example;

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

  var comments = collectComments(fileSource, settings.keyword);

  // parse YAML from comments
  comments = parseYAML(comments);

  // insert YAML data into store obj
  comments.forEach(function(comment, index){

    var doc = {
      file: filePath,
      type: comment.type
    };

    // mix doc with json doc
    doc = objectAssign(doc, comment.json);

    // check if usage example is available
    if(typeof comment.json.usage !== 'undefined'){

      doc.examples = [];

      // generate source and for each jade example push to doc
      if(Array.isArray(comment.json.usage)){
        comment.json.usage.forEach(function(example){
          doc.examples.push(generateExample(fileSource, example));
        });
      }else{
        doc.examples.push(generateExample(fileSource, comment.json.usage));
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