'use strict';
/* globals require, module */

var fs = require('fs');
var path = require('path');
var jade = require('jade');
var YAML = require('js-yaml');
var mkdirp = require('mkdirp');
var through2 = require('through2');
var assign = require('object-assign');
var jadeRuntime = require('jade-runtime');
var getCodeBlock = require('jade-code-block');
var fileRegister = require('text-file-register');


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

  var MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
  var JADEDOC_REGEX = /^\s*\/\/-\s+?\@jadedoc\s*$/;

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
      this.emit('complete');
      cb();
    }
  );

  
  /**
   * Init
   */
  
  function init(){
    
    // write stream to output file
    if(options.output){

      // create directory if it doesn't exist
      mkdirp.sync(path.dirname(options.output));

      // create writable stream
      var writable = fs.createWriteStream(options.output);

      // write stream
      stream.pipe(writable);

      // start json array
      stream.push('[');
    }

    // get all jade files
    var files = register.getAll();
    var file;

    // collect docs for all files
    for(file in files){
      collectDocs(files[file], file);
    }

    // end json array stream
    if(options.output){
      stream.push(']');
    }

    // end stream
    stream.push(null);
  }


  /**
   * Collect jade-doc comments
   */
  
  function collectDocs(src, file){

    // split by newline
    var lines = src.split('\n');

    // walk through lines
    lines.forEach(function(line, index){

      // check if line is jade doc flag
      var isJadeDoc = line.match(JADEDOC_REGEX);

      if(isJadeDoc){

        // find complete jade doc comment
        var docItem = {};
        var comment = getCodeBlock.byLine(src, index+1);

        // get meta
        docItem.meta = getMeta(comment);

        // add file path
        docItem.file = path.relative('.', file);
        
        // get jade code block matching the comments indent
        docItem.source = getCodeBlock.afterBlockAtLine(src, index+1);

        // get html output
        docItem.output = compileJade(docItem.source, file, docItem.meta);

        // omit first comma
        if(counter !== 0 && options.output){
          stream.push(',');
        }

        // add object to stream
        stream.push(docItem);

        // up counter
        ++counter;
      }
    });
  }


  /**
   * Get attributes
   */
  
  function getMeta(comment){

    // remove first line (@jadedoc)
    comment = comment.split('\n');
    comment.shift();
    comment = comment.join('\n');

    // parse YAML
    return YAML.safeLoad(comment);
  }


  /**
   * Compile Jade
   */
  
  function compileJade(src, file, meta){

    // add mixin call to mixin
    if(MIXIN_NAME_REGEX.test(src)){
      src += '\n+'+ src.match(MIXIN_NAME_REGEX)[1];

      if(meta.arguments){
        var args = [];
        var arg;

        for(arg in meta.arguments){
          args.push(JSON.stringify(meta.arguments[arg]));
        }

        src += '('+ args.join(',') +')';
      }
    }

    // compile jade
    var compiled = jade.compileClientWithDependenciesTracked(src, { filename: file });

    // render jade function
    return Function('jade', compiled.body + '\n' +'return template();')(jadeRuntime);
  }

  return stream;
 
}

module.exports = jadeDoc;