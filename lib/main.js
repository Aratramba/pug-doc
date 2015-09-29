'use strict';
/* globals require, module, console */

var jade = require('jade');
var jadeRuntime = require('jade-runtime');
var YAML = require('js-yaml');
var assign = require('object-assign');
var fileRegister = require('text-file-register');
var getCodeBlock = require('jade-code-block');

var constants = require('./constants');

function jadeDoc(settings){

  // settings
  settings = assign({
    output: 'jade-doc.json',
    directory: '.',
    complete: function(){}
  }, settings);

  // register files
  var register = fileRegister();
  register.addFiles(settings.input, init);


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

    // console.log(JSON.stringify(doc));

    if(settings.complete){
      settings.complete();
    }
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
      var isJadeDoc = line.match(constants.JADEDOC_REGEX);

      if(isJadeDoc){

        // find complete jade doc comment
        var docItem = {};
        docItem.comment = getCodeBlock.byLine(src, index+1);

        // get meta
        docItem.meta = getAttributes(docItem.comment);
        
        // get jade code block matching the comments indent
        docItem.jade = getCodeBlock.afterBlockAtLine(src, index+1);

        // get html output
        docItem.html = compileJade(docItem.jade, file, docItem.meta);

        // add doc
        docs.push(docItem);
      }
    });

    return docs;
  }


  /**
   * Get attributes
   */
  
  function getAttributes(comment){

    // remove first line (@jadedoc)
    comment = comment.split('\n');
    comment.shift();
    comment = comment.join('\n');

    // parse YAML
    return YAML.safeLoad(comment);
  }


  /**
   * Parse Jade
   */
  
  function compileJade(src, file, meta){

    // add mixin call to mixin
    if(constants.MIXIN_NAME_REGEX.test(src)){
      src += '\n+'+ src.match(constants.MIXIN_NAME_REGEX)[1];

      if(meta.arguments){
        var args = [];
        var arg;

        for(arg in meta.arguments){
          args.push(JSON.stringify(meta.arguments[arg]));
        }

        src += '('+ args.join(',') +')';
      }
    }

    var compiled = jade.compileClientWithDependenciesTracked(src, { filename: file });

    return Function('jade', compiled.body + '\n' +'return template();')(jadeRuntime);
  }

}

module.exports = jadeDoc;

jadeDoc({
  input: ['./test/fixtures/*.jade'],
  output: './test/tmp/output.json',
  complete: function(){
    console.log('complete');
  }
});