#!/usr/bin/env node
'use strict';

var meow = require('meow');
var jadeDoc = require('./');

var cli = meow({
  help: [
    'Usage',
    '  $ jade-doc input.jade output.json',
  ]
});

var jd = new jadeDoc({
  input: cli.input[0],
  output: cli.input[1]
});

if(!cli.input[1]){
  process.stdin.pipe(jd).pipe(process.stdout);

  jd.on('end', function(){
    process.exit();
  });
}