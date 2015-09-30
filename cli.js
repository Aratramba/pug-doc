#!/usr/bin/env node
'use strict';

var meow = require('meow');
var jadeDoc = require('./');

var cli = meow({
  help: [
    'Usage',
    '  $ jade-doc',
    '',
    'Options',
    '  --input  Input of jade files',
    '  --output  Destination json file',
  ]
});

var jd = new jadeDoc({
  input: cli.flags.input,
  output: cli.flags.output
});

if(!cli.flags.output){
  process.stdin.pipe(jd).pipe(process.stdout);

  jd.on('end', function(){
    process.exit();
  });
}