const test = require("tape");
const args = require("../lib/arguments");

test("jsdoc param", function (assert) {
  let actual, expected;

  // http://usejsdoc.org/tags-type.html
  // type symbol
  actual = args.parse("{boolean} arg - boolean");
  expected = {
    default: null,
    description: "boolean",
    name: "arg",
    nullable: false,
    optional: false,
    type: "boolean",
    original: "{boolean} arg - boolean",
  };
  assert.deepEqual(actual, expected, "type symbol");

  actual = args.parse("{myNamespace.MyClass} arg - myNamespace.MyClass");
  expected = {
    default: null,
    description: "myNamespace.MyClass",
    name: "arg",
    nullable: false,
    optional: false,
    type: "myNamespace.MyClass",
    original: "{myNamespace.MyClass} arg - myNamespace.MyClass",
  };
  assert.deepEqual(actual, expected, "type symbol");

  // type union
  actual = args.parse("{(number|boolean)} arg - number or boolean");
  expected = {
    default: null,
    description: "number or boolean",
    name: "arg",
    nullable: false,
    optional: false,
    type: ["number", "boolean"],
    original: "{(number|boolean)} arg - number or boolean",
  };
  assert.deepEqual(actual, expected, "type union");

  // type applications
  actual = args.parse("{Array.<MyClass>} arg - An array of MyClass instances.");
  expected = {
    default: null,
    description: "An array of MyClass instances.",
    name: "arg",
    nullable: false,
    optional: false,
    type: "Array",
    original: "{Array.<MyClass>} arg - An array of MyClass instances.",
  };
  assert.deepEqual(actual, expected, "type applications");

  actual = args.parse("{MyClass[]} arg - An array of MyClass instances.");
  expected = {
    default: null,
    description: "An array of MyClass instances.",
    name: "arg",
    nullable: false,
    optional: false,
    type: "Array",
    original: "{MyClass[]} arg - An array of MyClass instances.",
  };
  assert.deepEqual(actual, expected, "type applications");

  actual = args.parse(
    "{Object.<string, number>} arg - An object with string keys and number values"
  );
  expected = {
    default: null,
    description: "An object with string keys and number values",
    name: "arg",
    nullable: false,
    optional: false,
    type: "Object",
    original:
      "{Object.<string, number>} arg - An object with string keys and number values",
  };
  assert.deepEqual(actual, expected, "type applications");

  actual = args.parse(
    "{{a: number, b: string, c}} myObj - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type)."
  );
  expected = {
    default: null,
    description:
      "An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
    name: "myObj",
    nullable: false,
    optional: false,
    type: "Object",
    original:
      "{{a: number, b: string, c}} myObj - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
  };
  assert.deepEqual(actual, expected, "type record");

  actual = args.parse(
    "{Object} myObj - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type)."
  );
  expected = {
    default: null,
    description:
      "An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
    name: "myObj",
    nullable: false,
    optional: false,
    type: "Object",
    original:
      "{Object} myObj - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
  };
  assert.deepEqual(actual, expected, "type record");

  actual = args.parse(
    "{number} myObj.a - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type)."
  );
  expected = {
    default: null,
    description:
      "An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
    name: "myObj.a",
    nullable: false,
    optional: false,
    type: "number",
    original:
      "{number} myObj.a - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
  };
  assert.deepEqual(actual, expected, "type record");

  actual = args.parse(
    "{string} myObj.b - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type)."
  );
  expected = {
    default: null,
    description:
      "An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
    name: "myObj.b",
    nullable: false,
    optional: false,
    type: "string",
    original:
      "{string} myObj.b - An object called 'myObj' with properties 'a' (a number), 'b' (a string) and 'c' (any type).",
  };
  assert.deepEqual(actual, expected, "type record");

  // Nullable type
  actual = args.parse("{?number} arg - nullable");
  expected = {
    default: null,
    description: "nullable",
    name: "arg",
    nullable: true,
    optional: false,
    type: "number",
    original: "{?number} arg - nullable",
  };
  assert.deepEqual(actual, expected, "Nullable type");

  // Non-nullable type
  actual = args.parse("{!number} arg - non nullable");
  expected = {
    default: null,
    description: "non nullable",
    name: "arg",
    nullable: false,
    optional: false,
    type: "number",
    original: "{!number} arg - non nullable",
  };
  assert.deepEqual(actual, expected, "Non-nullable type");

  // Variable number of that type
  actual = args.parse(
    "{...number} arg - This function accepts a variable number of numeric parameters."
  );
  expected = {
    default: null,
    description:
      "This function accepts a variable number of numeric parameters.",
    name: "arg",
    nullable: false,
    optional: false,
    type: "number",
    original:
      "{...number} arg - This function accepts a variable number of numeric parameters.",
  };
  assert.deepEqual(actual, expected, "Variable number of that type");

  // Optional parameter
  actual = args.parse("{number} [foo] - An optional parameter named foo.");
  expected = {
    default: null,
    description: "An optional parameter named foo.",
    name: "foo",
    nullable: false,
    optional: true,
    type: "number",
    original: "{number} [foo] - An optional parameter named foo.",
  };
  assert.deepEqual(actual, expected, "Optional parameter");

  actual = args.parse("{number=} foo - An optional parameter named foo.");
  expected = {
    default: null,
    description: "An optional parameter named foo.",
    name: "foo",
    nullable: false,
    optional: true,
    type: "number",
    original: "{number=} foo - An optional parameter named foo.",
  };
  assert.deepEqual(actual, expected, "Optional parameter");

  actual = args.parse(
    "{number} [foo=1] - An optional parameter foo with default value 1."
  );
  expected = {
    default: "1",
    description: "An optional parameter foo with default value 1.",
    name: "foo",
    nullable: false,
    optional: true,
    type: "number",
    original:
      "{number} [foo=1] - An optional parameter foo with default value 1.",
  };
  assert.deepEqual(actual, expected, "Optional parameter");

  assert.end();
});

test("yaml arguments escape", function (assert) {
  let actual, expected;

  actual = args.escapeArgumentsYAML(
    "foo:\n  arguments:\n    - {string} str1 - my string\n    - {string} str2 - my string\n",
    "arguments"
  );
  expected =
    'foo:\n  arguments:\n    - "{string} str1 - my string"\n    - "{string} str2 - my string"\n';
  assert.equal(
    actual,
    expected,
    "arguments list needs to escaped before being passed to yaml parser."
  );

  actual = args.escapeArgumentsYAML("arguments:", "arguments");
  expected = "arguments:";
  assert.equal(actual, expected, "arguments should be empty");

  actual = args.escapeArgumentsYAML(
    "arguments:\n  - foo\n  - faa\n",
    "arguments"
  );
  expected = 'arguments:\n  - "foo"\n  - "faa"\n';
  assert.equal(
    actual,
    expected,
    "arguments should be a list of quotes strings"
  );

  assert.end();
});

test("yaml attributes escape", function (assert) {
  let actual, expected;

  actual = args.escapeArgumentsYAML(
    "foo:\n  attributes:\n    - {string} str1 - my string\n    - {string} str2 - my string\n",
    "attributes"
  );
  expected =
    'foo:\n  attributes:\n    - "{string} str1 - my string"\n    - "{string} str2 - my string"\n';
  assert.equal(
    actual,
    expected,
    "attributes list needs to escaped before being passed to yaml parser."
  );

  actual = args.escapeArgumentsYAML("attributes:", "attributes");
  expected = "attributes:";
  assert.equal(actual, expected, "attributes should be empty");

  actual = args.escapeArgumentsYAML(
    "attributes:\n  - foo\n  - faa\n",
    "attributes"
  );
  expected = 'attributes:\n  - "foo"\n  - "faa"\n';
  assert.equal(
    actual,
    expected,
    "attributes should be a list of quotes strings"
  );

  assert.end();
});

test("get jsdoc name", function (assert) {
  assert.equal(args.getJSDocName("attr1-foo"), "attr1-foo");
  assert.equal(args.getJSDocName("attr1 - this is attr1"), "attr1");
  assert.equal(
    args.getJSDocName("attr1-foo-foo - this is attr1"),
    "attr1-foo-foo"
  );
  assert.equal(
    args.getJSDocName("attr1-foo-foo this is attr1"),
    "attr1-foo-foo"
  );
  assert.equal(args.getJSDocName("{string} attr1 - this is attr1"), "attr1");
  assert.equal(args.getJSDocName("{string} attr2 - this is attr2"), "attr2");
  assert.equal(
    args.getJSDocName("{string} data-attr3 - this is attr3"),
    "data-attr3"
  );
  assert.equal(
    args.getJSDocName("{string} data-attr3-foo - this is attr3"),
    "data-attr3-foo"
  );
  assert.equal(
    args.getJSDocName("{string} data-attr3--foo - this is attr3"),
    "data-attr3--foo"
  );
  assert.equal(
    args.getJSDocName("{string} [attr4=Some string] - this is attr4"),
    "attr4"
  );
  assert.equal(
    args.getJSDocName("{string} [attr4-foo-faa=Some string] - this is attr4"),
    "attr4-foo-faa"
  );
  assert.equal(args.getJSDocName("{string}  attr1 - this is attr1"), "attr1");
  assert.equal(args.getJSDocName("{string}  attr2 - this is attr2"), "attr2");
  assert.equal(
    args.getJSDocName("{string}  data-attr3 - this is attr3"),
    "data-attr3"
  );
  assert.equal(
    args.getJSDocName("{string}  [attr4=Some string] - this is attr4"),
    "attr4"
  );
  assert.equal(args.getJSDocName("{string} attr1- this is attr1"), "attr1");
  assert.equal(args.getJSDocName("{string} attr2- this is attr2"), "attr2");
  assert.equal(
    args.getJSDocName("{string} data-attr3- this is attr3"),
    "data-attr3"
  );
  assert.equal(
    args.getJSDocName("{string} [attr4=Some string]- this is attr4"),
    "attr4"
  );
  assert.equal(args.getJSDocName("{string} attr1- this is attr1"), "attr1");
  assert.equal(args.getJSDocName("{string} attr2- this is attr2"), "attr2");
  assert.equal(
    args.getJSDocName("{string} data-attr3- this is attr3"),
    "data-attr3"
  );
  assert.equal(
    args.getJSDocName("{string} [attr4=Some string]- this is attr4"),
    "attr4"
  );
  assert.equal(
    args.getJSDocName("{string} attr1_foo- this is attr1"),
    "attr1_foo"
  );
  assert.equal(
    args.getJSDocName("{string} attr2_foo-faa- this is attr2"),
    "attr2_foo-faa"
  );
  assert.equal(
    args.getJSDocName("{string} attr1_foo- this is attr1-foo"),
    "attr1_foo"
  );
  assert.equal(
    args.getJSDocName("{string} attr2_foo-faa- this is attr2-faa"),
    "attr2_foo-faa"
  );
  assert.equal(
    args.getJSDocName("{string} myObj.b this is attr2-faa"),
    "myObj.b"
  );
  assert.equal(args.getJSDocName("{Array.<MyClass>} foo - faa"), "foo");
  assert.equal(args.getJSDocName("{Array.<MyClass>} foo faa"), "foo");
  assert.equal(
    args.getJSDocName("{number} [foo] - An optional parameter named foo."),
    "foo"
  );
  assert.end();
});
