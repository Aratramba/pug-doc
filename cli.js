#!/usr/bin/env node
'use strict';

var meow = require('meow');
var jadeDoc = require('./index');

var cli = meow({
  help: [
    'Usage',
    '  $ jade-doc input.jade --output output.json',
    '',
    'Options',
    '  --output    Set output json file',
  ]
});

var jd = new jadeDoc({
  input: cli.input[0],
  output: cli.flags.output
});

if(!cli.flags.output){
  process.stdin.pipe(jd).pipe(process.stdout);

  jd.on('end', function(){
    process.exit();
  });
}