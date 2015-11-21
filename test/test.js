'use strict';
/* global require */

var test = require('tape');
var fs = require('fs');
var jadeDoc = require('../');
var jadeDocParser = require('../lib/parser');


/**
 * Simple Jade tag
 */

test('tag', function(assert){

  var stream = jadeDoc({
    input: ['./test/fixtures/tag.jade']
  });

  stream.on('data', function(data){

    var actual = data.meta.name;
    var expected = 'some-tag';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/tag.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');
    
    actual = data.source;
    expected = 'div.some-tag\n  | this is some tag #{foo}';
    assert.equal(actual, expected, 'Source code block should be correct');

    actual = data.output;
    expected = '<div class=\"some-tag\">this is some tag foo</div>';
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

    var actual = data.meta.name;
    var expected = 'mixin';
    assert.equal(actual, expected, 'Name should match name inside YAML data');

    actual = data.meta.description;
    expected = 'this is jade mixin documentation';
    assert.equal(actual, expected, 'Description should match description inside YAML data');

    actual = data.file;
    expected = 'test/fixtures/mixins.jade';
    assert.equal(actual, expected, 'Filename should match the jade file');


    // arguments
    actual = Array.isArray(data.meta.arguments);
    expected = true;
    assert.equal(actual, expected, 'Arguments should be an array');

    actual = data.meta.arguments[0].name;
    expected = 'arg1';
    assert.equal(actual, expected, 'Argument 1 name should be arg1');

    actual = data.meta.arguments[0].type;
    expected = 'string';
    assert.equal(actual, expected, 'Argument 1 type should be string');

    actual = data.meta.arguments[0].original;
    expected = '{string} arg1 - this is arg1';
    assert.equal(actual, expected, 'Argument 1 original should be the jsdoc string');

    actual = data.meta.arguments[1].name;
    expected = 'arg2';
    assert.equal(actual, expected, 'Argument 2 name should be arg1');

    actual = data.meta.arguments[1].type;
    expected = 'string';
    assert.equal(actual, expected, 'Argument 2 type should be string');

    actual = data.meta.arguments[1].original;
    expected = '{string} arg2 - this is arg2';
    assert.equal(actual, expected, 'Argument 2 original should be the jsdoc string');


    // attributes
    actual = Array.isArray(data.meta.attributes);
    expected = true;
    assert.equal(actual, expected, 'Attributes should be an array');

    actual = data.meta.attributes[0].name;
    expected = 'attr1';
    assert.equal(actual, expected, 'Attribute 1 name should be arg1');

    actual = data.meta.attributes[0].type;
    expected = 'string';
    assert.equal(actual, expected, 'Attribute 1 type should be string');

    actual = data.meta.attributes[0].original;
    expected = '{string} attr1 - this is attr1';
    assert.equal(actual, expected, 'Attribute 1 original should be the jsdoc string');

    actual = data.meta.attributes[1].name;
    expected = 'attr2';
    assert.equal(actual, expected, 'Attribute 2 name should be attr2');

    actual = data.meta.attributes[1].type;
    expected = 'string';
    assert.equal(actual, expected, 'Attribute 2 type should be string');

    actual = data.meta.attributes[1].original;
    expected = '{string} attr2 - this is attr2';
    assert.equal(actual, expected, 'Attribute 2 original should be the jsdoc string');


    // source
    actual = data.source;
    expected = 'mixin mixin2(arg1, arg2)\n  div this is a mixin #{arg1}\n  div this is the same mixin #{arg2}';
    assert.equal(actual, expected, 'Source should match the complete mixin code block');
    
    actual = data.output;
    expected = '<div>this is a mixin foo</div><div>this is the same mixin faa</div><div>this is a mixin faa</div><div>this is the same mixin foo</div>';
    assert.equal(actual, expected, 'HTML output should be the rendered mixin with passed arguments.');

    actual = data.meta.examples;
    expected = ['+mixin2(\'foo\', \'faa\') // mixin example description', '+mixin2(\'faa\', \'foo\')'];
    assert.deepEqual(actual, expected, 'examples should be an array');

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
    expected = '<div class=\"some-tag\">this is some tag foo</div><div class=\"some-other-tag\">this is some other tag</div>';
    assert.equal(actual, expected, 'Output should match the html compiled from tag.jade');
    
    assert.end();
  });
});


/**
 * Parser
 */

test('Parser: extract jadedoc', function(assert){
  var src = fs.readFileSync('./test/fixtures/multiple.jade').toString();

  var actual = jadeDocParser.extractJadedocBlocks(src);
  var expected =  [ { code: 'p foo', comment: '//- @jadedoc\n  name: foo', lineNumber: 1 }, { code: 'p faa', comment: '//- @jadedoc', lineNumber: 6 } ];
  assert.deepEqual(actual, expected, 'extractor should return array with objects');

  actual = jadeDocParser.extractJadedocBlocks('//- @jadedoc\nname: foo');
  expected = [ { code: 'name: foo', comment: '//- @jadedoc', lineNumber: 1 } ];
  assert.deepEqual(actual, expected, 'extractor should return array with objects');

  actual = jadeDocParser.extractJadedocBlocks('');
  expected = [];
  assert.deepEqual(actual, expected, 'extractor should return empty array when nothing was passed in');

  actual = jadeDocParser.extractJadedocBlocks('//- @jadedoc');
  expected = [];
  assert.deepEqual(actual, expected, 'extractor should return empty array when only an empty jadedoc was passed');

  assert.end();
});

test('Parser: parse comment', function(assert){

  var actual = jadeDocParser.parseJadedocComment('\nname: foo\ndescription: faa');
  var expected = { name: 'foo', description: 'faa' };
  assert.deepEqual(actual, expected, 'yaml comment should return object');

  actual = jadeDocParser.parseJadedocComment('');
  expected = {};
  assert.deepEqual(actual, expected, 'comment parser should return empty object if no input was given');

  actual = jadeDocParser.parseJadedocComment('//- @jadedoc');
  expected = {};
  assert.deepEqual(actual, expected, 'comment parser should return empty object if no input was given');

  actual = jadeDocParser.parseJadedocComment('//- @jadedoc\n');
  expected = {};
  assert.deepEqual(actual, expected, 'comment parser should return empty object if no input was given');

  assert.end();
});

test('Parser: parse doc', function(assert){
  var src = fs.readFileSync('./test/fixtures/multiple.jade').toString();

  var actual = jadeDocParser.getJadedocDocuments(src, 'test.jade');
  var expected = [ { file: 'test.jade', meta: { name: 'foo' }, output: '<p>foo</p>', source: 'p foo' }, { file: 'test.jade', meta: {}, output: '<p>faa</p>', source: 'p faa' } ];
  assert.deepEqual(actual, expected, 'document parser should return valid object');

  actual = jadeDocParser.getJadedocDocuments('', 'test.jade');
  expected = {};
  assert.deepEqual(actual, expected, 'document parser should return empty object');

  assert.end();
});

test('Get examples', function(assert){

  var actual = jadeDocParser.getExamples({ example: 'foo' });
  var expected = ['foo'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given example object string');

  actual = jadeDocParser.getExamples({ example: ['foo', 'faa'] });
  expected = ['foo', 'faa'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given example object array');

  actual = jadeDocParser.getExamples({ example: '' });
  expected = [];
  assert.deepEqual(actual, expected, 'should return an empty when given an empty examples string');

  actual = jadeDocParser.getExamples({ examples: 'foo' });
  expected = ['foo'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given examples object string');

  actual = jadeDocParser.getExamples({ examples: ['foo', 'faa'] });
  expected = ['foo', 'faa'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given examples object array');

  actual = jadeDocParser.getExamples({ examples: '' });
  expected = [];
  assert.deepEqual(actual, expected, 'should return an empty when given an empty examples string');

  actual = jadeDocParser.getExamples({ example: 'bar', examples: ['foo', 'faa'] });
  expected = ['bar', 'foo', 'faa'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given examples object array and example string');

  actual = jadeDocParser.getExamples({ example: '', examples: ['foo', 'faa'] });
  expected = ['foo', 'faa'];
  assert.deepEqual(actual, expected, 'should return an array of examples when given examples object array');

  actual = jadeDocParser.getExamples({ example: [], examples: [] });
  expected = [];
  assert.deepEqual(actual, expected, 'should return an empty array of examples when given empty examples object array');

  assert.end();
});