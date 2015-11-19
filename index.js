'use strict';
/* globals require, module */

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var through2 = require('through2');
var assign = require('object-assign');
var fileRegister = require('text-file-register');
var jadedocParser = require('./lib/parser.js');


/**
 * Jade Documentation generator
 * returns a JSON stream
 * optionally writes a JSON array containing
 * all docs to an output file.
 */

function jadeDoc(options){

  if(typeof options === 'undefined'){
    throw new Error('Jade doc requires a settings object.');
  }

  if(typeof options.input === 'undefined'){
    throw new Error('Jade doc requires settings.input to be set.');
  }

  // options
  options = assign({
    input: null,
    output: null
  }, options);

  var counter = 0;

  // register files
  var register = fileRegister();
  register.addFiles(options.input, init);


  // create readable stream
  var stream = through2({ objectMode: true },
    function(chunk, enc, next){
      this.push(chunk);
      next();
    },
    function(cb){
      cb();
    }
  );

  var output;


  /**
   * Init
   */

  function init(){

    // write stream to output file
    if(options.output){

      // create directory if it doesn't exist
      mkdirp.sync(path.dirname(options.output));

      // create writable stream
      output = fs.createWriteStream(options.output);
      output.write('[');

      output.on('close', function(){
        stream.emit('complete');
      });
    }

    // get all jade files
    var files = register.getAll();
    var file;

    // collect docs for all files
    for(file in files){
      var jadeDocDocuments = jadedocParser.getJadedocDocuments(files[file], file);
      jadeDocDocuments.forEach(function(docItem) {
        // omit first comma
        if(counter !== 0 && options.output){
          output.write(',');
        }
        // add object to stream
        stream.push(docItem);
        if(options.output){
          // send to output
          output.write(JSON.stringify(docItem));
        }
        // up counter
        ++counter;
      });
    }

    // end json array stream
    if(options.output){
      output.write(']');
      output.end();
    }

    // end stream
    stream.push(null);
  }

  return stream;

}

module.exports = jadeDoc;