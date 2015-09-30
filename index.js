'use strict';
/* globals require, module, console */

var jade = require('jade');
var YAML = require('js-yaml');
var assign = require('object-assign');
var jadeRuntime = require('jade-runtime');
var getCodeBlock = require('jade-code-block');
var writeJsonFile = require('write-json-file');
var fileRegister = require('text-file-register');


var MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
var JADEDOC_REGEX = /^\s*\/\/-\s+?\@jadedoc\s*$/;


function jadeDoc(options){

  if(typeof options.input === 'undefined'){
    throw new Error('Jade doc requires settings.input to be set.');
  }


  // options
  options = assign({
    input: null,
    output: null,
    pretty: true,
    complete: function(){}
  }, options);

  // register files
  var register = fileRegister();
  register.addFiles(options.input, init);


  /**
   * Init
   */
  
  function init(){
    var files = register.getAll();
    var doc = {};
    var file;

    for(file in files){
      doc[file] = {};
      doc[file].comments = collectDocs(files[file], file);
    }

    complete(doc);
  }


  /**
   * Collect jade-doc comments
   */
  
  function collectDocs(src, file){

    // split by newline
    var lines = src.split('\n');
    var docs = [];

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
        
        // get jade code block matching the comments indent
        docItem.source = getCodeBlock.afterBlockAtLine(src, index+1);

        // get html output
        docItem.output = compileJade(docItem.source, file, docItem.meta);

        // add doc
        docs.push(docItem);
      }
    });

    return docs;
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


  /**
   * Complete
   */
  
  function complete(doc){    
    if(options.output){
      writeJsonFile(options.output, doc, {indent: null}).then(function () {
        console.log('Saved '+ options.output);
      });
    }
  }

}

module.exports = jadeDoc;

jadeDoc({
  input: ['./test/fixtures/*.jade'],
  output: './test/tmp/output.json',
});