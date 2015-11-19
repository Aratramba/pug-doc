'use strict';
/* global require */

var test = require('tape');
var args = require('../lib/arguments');

test('parser', function(assert){
  var actual, expected;


  // http://usejsdoc.org/tags-type.html
  // type symbol
  actual = args.parse('{boolean} arg - boolean');
  expected = { 
    default: null, 
    description: 'boolean', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'boolean' 
  };
  assert.deepEqual(actual, expected, 'type symbol');

  actual = args.parse('{myNamespace.MyClass} arg - myNamespace.MyClass');
  expected = { 
    default: null, 
    description: 'myNamespace.MyClass', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'myNamespace.MyClass' 
  };
  assert.deepEqual(actual, expected, 'type symbol');


  // type union
  actual = args.parse('{(number|boolean)} arg - number or boolean');
  expected = { 
    default: null, 
    description: 'number or boolean', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: [ 'number', 'boolean' ] };
  assert.deepEqual(actual, expected, 'type union');


  // type applications
  actual = args.parse('{Array.<MyClass>} arg - An array of MyClass instances.');
  expected = { 
    default: null, 
    description: 'An array of MyClass instances.', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'Array' 
  };
  assert.deepEqual(actual, expected, 'type applications');

  actual = args.parse('{MyClass[]} arg - An array of MyClass instances.');
  expected = { 
    default: null, 
    description: 'An array of MyClass instances.', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'Array' 
  };
  assert.deepEqual(actual, expected, 'type applications');

  actual = args.parse('{Object.<string, number>} arg - An object with string keys and number values');
  expected = { 
    default: null, 
    description: 'An object with string keys and number values', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'Object' 
  };
  assert.deepEqual(actual, expected, 'type applications');


  actual = args.parse('{{a: number, b: string, c}} myObj - An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).');
  expected = { 
    default: null, 
    description: 'An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).', 
    name: 'myObj', 
    nullable: false, 
    optional: false, 
    type: 'Object' 
  };
  assert.deepEqual(actual, expected, 'type record');

  actual = args.parse('{Object} myObj - An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).');
  expected =  { default: null, 
    description: 'An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).', 
    name: 'myObj', 
    nullable: false, 
    optional: false, 
    type: 'Object' 
  };
  assert.deepEqual(actual, expected, 'type record');

  actual = args.parse('{number} myObj.a - An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).');
  expected = { 
    default: null, 
    description: 'An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).', 
    name: 'myObj.a', 
    nullable: false, 
    optional: false, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'type record');

  actual = args.parse('{string} myObj.b - An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).');
  expected = { 
    default: null, 
    description: 'An object called \'myObj\' with properties \'a\' (a number), \'b\' (a string) and \'c\' (any type).', 
    name: 'myObj.b', 
    nullable: false, 
    optional: false, 
    type: 'string' 
  };
  assert.deepEqual(actual, expected, 'type record');


  // Nullable type
  actual = args.parse('{?number} arg - nullable');
  expected = { 
    default: null, 
    description: 'nullable', 
    name: 'arg', 
    nullable: true, 
    optional: false, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Nullable type');


  // Non-nullable type
  actual = args.parse('{!number} arg - non nullable');
  expected = { 
    default: null, 
    description: 'non nullable', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Non-nullable type');


  // Variable number of that type
  actual = args.parse('{...number} arg - This function accepts a variable number of numeric parameters.');
  expected = { 
    default: null, 
    description: 'This function accepts a variable number of numeric parameters.', 
    name: 'arg', 
    nullable: false, 
    optional: false, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Variable number of that type');


  // Optional parameter
  actual = args.parse('{number} [foo] - An optional parameter named foo.');
  expected = { 
    default: null, 
    description: 'An optional parameter named foo.', 
    name: 'foo', 
    nullable: false, 
    optional: true, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Optional parameter');

  actual = args.parse('{number=} foo - An optional parameter named foo.');
  expected = { 
    default: null, 
    description: 'An optional parameter named foo.', 
    name: 'foo', 
    nullable: false, 
    optional: true, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Optional parameter');

  actual = args.parse('{number} [foo=1] - An optional parameter foo with default value 1.');
  expected = { 
    default: '1', 
    description: 'An optional parameter foo with default value 1.', 
    name: 'foo', 
    nullable: false, 
    optional: true, 
    type: 'number' 
  };
  assert.deepEqual(actual, expected, 'Optional parameter');

  assert.end();
});