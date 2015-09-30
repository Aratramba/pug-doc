'use strict';
/* global require */

var test = require('tape');
var jadeDoc = require('../');


/**
 * Simple Jade tag
 */

test('tag', function(assert){

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

    assert.end();
  });
});


/**
 * Mixins
 */

test('mixins', function(assert){

  var stream = jadeDoc({
    input: ['./test/fixtures/mixins.jade']
  });

  stream.on('data', function(data){
    data = JSON.parse(data);

    var actual = data.meta.name;
    var expected = 'mixin';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.meta.description;
    expected = 'this is jade mixin documentation';
    assert.equal(actual, expected, 'Description should match description inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/mixins.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');

    actual = typeof data.meta.arguments;
    expected = 'object';
    assert.equal(actual, expected, 'Arguments should be an object');

    actual = data.meta.arguments.arg1;
    expected = 'foo';
    assert.equal(actual, expected, 'Argument 1 value should be foo');
    
    actual = data.meta.arguments.arg2;
    expected = 'faa';
    assert.equal(actual, expected, 'Argument 2 value should be faa');
    
    actual = data.source;
    expected = 'mixin mixin2(arg1, arg2)\n  div this is a mixin #{arg1}\n  div this is the same mixin #{arg2}';
    assert.equal(actual, expected, 'Source should match the complete mixin code block');
    
    actual = data.output;
    expected = '<div>this is a mixin foo</div><div>this is the same mixin faa</div>';
    assert.equal(actual, expected, 'HTML output should be the rendered mixin with passed arguments.');

    assert.end();
  });
});


/**
 * Include
 */

test('Include', function(assert){

  var stream = jadeDoc({
    input: ['./test/fixtures/include.jade']
  });

  stream.on('data', function(data){
    data = JSON.parse(data);

    var actual = data.meta.name;
    var expected = 'inclusion tag';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.meta.description;
    expected = 'this is an inclusion tag';
    assert.equal(actual, expected, 'Description should match description inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/include.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');

    actual = data.source;
    expected = 'div\n  include mixins.jade\n  +mixin2(\'foo\', \'faa\')';
    assert.equal(actual, expected, 'Source should match the complete mixin code block');
    
    actual = data.output;
    expected = '<div><div>this is a mixin foo</div><div>this is the same mixin faa</div></div>';
    assert.equal(actual, expected, 'HTML output should be the rendered mixin with passed arguments.');

    assert.end();
  });
});


/**
 * Extends
 */

test('Extends', function(assert){

  var stream = jadeDoc({
    input: ['./test/fixtures/extends.jade']
  });

  stream.on('data', function(data){
    data = JSON.parse(data);

    var actual = data.meta.name;
    var expected = 'extends';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/extends.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');

    actual = data.source;
    expected = 'extends tag.jade';
    assert.equal(actual, expected, 'Source should match the extends tag');
    
    actual = data.output;
    expected = '<div class=\"some-tag\">this is some tag</div><div class=\"some-other-tag\">this is some other tag</div>';
    assert.equal(actual, expected, 'Output should match the html compiled from tag.jade');
    
    assert.end();
  });
});