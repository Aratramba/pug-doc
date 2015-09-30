'use strict';
/* global require */

var test = require('tape');
var jadeDoc = require('../');

test('tag', function(assert){
  assert.plan(4);

  var stream = jadeDoc({
    input: ['./test/fixtures/tag.jade']
  });

  stream.on('data', function(data){
    data = JSON.parse(data);

    var actual = data.meta.name;
    var expected = 'some-tag';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/tag.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');
    
    actual = data.source;
    expected = 'div.some-tag\n  | this is some tag';
    assert.equal(actual, expected, 'Source code block should be correct');

    actual = data.output;
    expected = '<div class=\"some-tag\">this is some tag</div>';
    assert.equal(actual, expected, 'Its html output should be correct');
  });
});