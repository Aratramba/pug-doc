'use strict';
/* global require */

var test = require('tape');
var findCodeBlock = require('../../lib/code-block/find');


test('testing 1,2', function(assert){
  console.log(findCodeBlock());
  assert.plan(1);
  assert.equal(1,1);
});