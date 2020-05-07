const test = require("tape");
const fs = require("fs");
const pugDoc = require("../index");
const pugDocParser = require("../lib/parser");

/**
 * Complete
 */

test("complete", function (assert) {
  assert.plan(2);

  // callback
  pugDoc({
    input: ["./test/fixtures/capture.pug", "./test/fixtures/examples.pug"],
    complete: function () {
      assert.pass();
    },
  });

  // callback
  pugDoc({
    input: ["./test/fixtures/tag.pug"],
    output: "./test/tmp/tag.json",
    complete: function () {
      let src = fs.readFileSync("./test/tmp/tag.json").toString();
      let obj = JSON.parse(src)[0];
      assert.equal(
        obj.output,
        '<div class="some-tag">this is some tag foo</div>'
      );
    },
  });

  // silently do nothing
  pugDoc({
    input: ["./test/fixtures/capture.pug", "./test/fixtures/examples.pug"],
    complete: null,
  });
});

/**
 * Simple Pug tag
 */

test("tag", function (assert) {
  let stream = pugDoc({
    input: ["./test/fixtures/tag.pug"],
  });

  stream.on("data", function (data) {
    let actual = data.meta.name;
    let expected = "some-tag";
    assert.equal(actual, expected, "Name should match name inside YAML data");

    actual = data.file;
    expected = "test/fixtures/tag.pug";
    assert.equal(actual, expected, "Filename should match the jade file");

    actual = data.source;
    expected = "div.some-tag\n  | this is some tag #{foo}";
    assert.equal(actual, expected, "Source code block should be correct");

    actual = data.output;
    expected = '<div class="some-tag">this is some tag foo</div>';
    assert.equal(actual, expected, "Its html output should be correct");

    assert.end();
  });
});

/**
 * Mixins
 */

test("mixins", function (assert) {
  let stream = pugDoc({
    input: ["./test/fixtures/mixins.pug"],
  });

  stream.on("data", function (data) {
    let actual = data.meta.name;
    let expected = "mixin";
    assert.equal(actual, expected, "Name should match name inside YAML data");

    actual = data.meta.description;
    expected = "this is jade mixin documentation";
    assert.equal(
      actual,
      expected,
      "Description should match description inside YAML data"
    );

    actual = data.file;
    expected = "test/fixtures/mixins.pug";
    assert.equal(actual, expected, "Filename should match the jade file");

    // arguments
    actual = Array.isArray(data.meta.arguments);
    expected = true;
    assert.equal(actual, expected, "Arguments should be an array");

    actual = data.meta.arguments[0].name;
    expected = "arg1";
    assert.equal(actual, expected, "Argument 1 name should be arg1");

    actual = data.meta.arguments[0].type;
    expected = "string";
    assert.equal(actual, expected, "Argument 1 type should be string");

    actual = data.meta.arguments[0].original;
    expected = "{string} arg1 - this is arg1";
    assert.equal(
      actual,
      expected,
      "Argument 1 original should be the jsdoc string"
    );

    actual = data.meta.arguments[1].name;
    expected = "arg2";
    assert.equal(actual, expected, "Argument 2 name should be arg1");

    actual = data.meta.arguments[1].type;
    expected = "string";
    assert.equal(actual, expected, "Argument 2 type should be string");

    actual = data.meta.arguments[1].original;
    expected = "{string} arg2 - this is arg2";
    assert.equal(
      actual,
      expected,
      "Argument 2 original should be the jsdoc string"
    );

    // attributes
    actual = Array.isArray(data.meta.attributes);
    expected = true;
    assert.equal(actual, expected, "Attributes should be an array");

    actual = data.meta.attributes[0].name;
    expected = "attr1";
    assert.equal(actual, expected, "Attribute 1 name should be arg1");

    actual = data.meta.attributes[0].type;
    expected = "string";
    assert.equal(actual, expected, "Attribute 1 type should be string");

    actual = data.meta.attributes[0].original;
    expected = "{string} attr1 - this is attr1";
    assert.equal(
      actual,
      expected,
      "Attribute 1 original should be the jsdoc string"
    );

    actual = data.meta.attributes[1].name;
    expected = "attr2";
    assert.equal(actual, expected, "Attribute 2 name should be attr2");

    actual = data.meta.attributes[1].type;
    expected = "string";
    assert.equal(actual, expected, "Attribute 2 type should be string");

    actual = data.meta.attributes[1].original;
    expected = "{string} attr2 - this is attr2";
    assert.equal(
      actual,
      expected,
      "Attribute 2 original should be the jsdoc string"
    );

    actual = data.meta.attributes[2].name;
    expected = "data-attr3";
    assert.equal(actual, expected, "Attribute 3 name should be data-attr3");

    actual = data.meta.attributes[2].type;
    expected = "string";
    assert.equal(actual, expected, "Attribute 3 type should be string");

    actual = data.meta.attributes[2].original;
    expected = "{string} data-attr3 - this is attr3";
    assert.equal(
      actual,
      expected,
      "Attribute 3 original should be the jsdoc string"
    );

    // source
    actual = data.source;
    expected =
      "mixin mixin2(arg1, arg2)\n  div this is a mixin #{arg1}\n  div this is the same mixin #{arg2}";
    assert.equal(
      actual,
      expected,
      "Source should match the complete mixin code block"
    );

    actual = data.output;
    expected =
      "<div>this is a mixin foo</div><div>this is the same mixin faa</div><div>this is a mixin faa</div><div>this is the same mixin foo</div><div>this is a mixin beep</div><div>this is the same mixin boop</div>";
    assert.equal(
      actual,
      expected,
      "HTML output should be the rendered mixin with passed arguments."
    );

    actual = data.meta.examples;
    expected = [
      "+mixin2('foo', 'faa') // mixin example description",
      "+mixin2('faa', 'foo')",
      "+mixin2('beep', 'boop')\n",
    ];
    assert.deepEqual(actual, expected, "examples should be an array");

    assert.end();
  });
});

/**
 * Include
 */

test("Include", function (assert) {
  let stream = pugDoc({
    input: ["./test/fixtures/include.pug"],
  });

  stream.on("data", function (data) {
    let actual = data.meta.name;
    let expected = "inclusion tag";
    assert.equal(actual, expected, "Name should match name inside YAML data");

    actual = data.meta.description;
    expected = "this is an inclusion tag";
    assert.equal(
      actual,
      expected,
      "Description should match description inside YAML data"
    );

    actual = data.file;
    expected = "test/fixtures/include.pug";
    assert.equal(actual, expected, "Filename should match the jade file");

    actual = data.source;
    expected =
      "div\n  include mixins.pug\n  include deprecated.jade\n  +mixin2('foo', 'faa')";
    assert.equal(
      actual,
      expected,
      "Source should match the complete mixin code block"
    );

    actual = data.output;
    expected =
      "<div>deprecated .jade file<div>this is a mixin foo</div><div>this is the same mixin faa</div></div>";
    assert.equal(
      actual,
      expected,
      "HTML output should be the rendered mixin with passed arguments."
    );

    assert.end();
  });
});

/**
 * Extends
 */

test("Extends", function (assert) {
  let stream = pugDoc({
    input: ["./test/fixtures/extends.pug"],
  });

  stream.on("data", function (data) {
    let actual = data.meta.name;
    let expected = "extends";
    assert.equal(actual, expected, "Name should match name inside YAML data");

    actual = data.file;
    expected = "test/fixtures/extends.pug";
    assert.equal(actual, expected, "Filename should match the jade file");

    actual = data.source;
    expected = "extends tag.pug";
    assert.equal(actual, expected, "Source should match the extends tag");

    actual = data.output;
    expected =
      '<div class="some-tag">this is some tag foo</div><div class="some-other-tag">this is some other tag</div>';
    assert.equal(
      actual,
      expected,
      "Output should match the html compiled from tag.pug"
    );

    assert.end();
  });
});

/**
 * Parser
 */

test("Parser: extract pugDoc", function (assert) {
  let src = fs.readFileSync("./test/fixtures/multiple.pug").toString();

  let actual = pugDocParser.extractPugdocBlocks(src);
  let expected = [
    { code: "p foo", comment: "//- @pugdoc\n  name: foo", lineNumber: 1 },
    { code: "p faa", comment: "//- @pugdoc", lineNumber: 6 },
  ];
  assert.deepEqual(
    actual,
    expected,
    "extractor should return array with objects"
  );

  actual = pugDocParser.extractPugdocBlocks("//- @pugdoc\nname: foo");
  expected = [{ code: "name: foo", comment: "//- @pugdoc", lineNumber: 1 }];
  assert.deepEqual(
    actual,
    expected,
    "extractor should return array with objects"
  );

  actual = pugDocParser.extractPugdocBlocks("");
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "extractor should return empty array when nothing was passed in"
  );

  actual = pugDocParser.extractPugdocBlocks("//- @pugdoc");
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "extractor should return empty array when only an empty pugDoc was passed"
  );

  assert.end();
});

test("Parser: parse comment", function (assert) {
  let actual = pugDocParser.parsePugdocComment("\nname: foo\ndescription: faa");
  let expected = { name: "foo", description: "faa" };
  assert.deepEqual(actual, expected, "yaml comment should return object");

  actual = pugDocParser.parsePugdocComment("");
  expected = {};
  assert.deepEqual(
    actual,
    expected,
    "comment parser should return empty object if no input was given"
  );

  actual = pugDocParser.parsePugdocComment("//- @pugdoc");
  expected = {};
  assert.deepEqual(
    actual,
    expected,
    "comment parser should return empty object if no input was given"
  );

  actual = pugDocParser.parsePugdocComment("//- @pugdoc\n");
  expected = {};
  assert.deepEqual(
    actual,
    expected,
    "comment parser should return empty object if no input was given"
  );

  assert.end();
});

test("Parser: parse doc", function (assert) {
  let src = fs.readFileSync("./test/fixtures/multiple.pug").toString();

  let actual = pugDocParser.getPugdocDocuments(src, "test.pug");
  let expected = [
    {
      file: "test.pug",
      meta: { name: "foo" },
      output: "<p>foo</p>",
      source: "p foo",
    },
    { file: "test.pug", meta: {}, output: "<p>faa</p>", source: "p faa" },
  ];
  assert.deepEqual(
    actual,
    expected,
    "document parser should return valid object"
  );

  actual = pugDocParser.getPugdocDocuments("", "test.pug");
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "document parser should return empty object"
  );

  assert.end();
});

test("Get examples", function (assert) {
  let actual = pugDocParser.getExamples({ example: "foo" });
  let expected = ["foo"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given example object string"
  );

  actual = pugDocParser.getExamples({ example: ["foo", "faa"] });
  expected = ["foo", "faa"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given example object array"
  );

  actual = pugDocParser.getExamples({ example: "" });
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "should return an empty when given an empty examples string"
  );

  actual = pugDocParser.getExamples({ examples: "foo" });
  expected = ["foo"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given examples object string"
  );

  actual = pugDocParser.getExamples({ examples: ["foo", "faa"] });
  expected = ["foo", "faa"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given examples object array"
  );

  actual = pugDocParser.getExamples({ examples: "" });
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "should return an empty when given an empty examples string"
  );

  actual = pugDocParser.getExamples({
    example: "bar",
    examples: ["foo", "faa"],
  });
  expected = ["bar", "foo", "faa"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given examples object array and example string"
  );

  actual = pugDocParser.getExamples({ example: "", examples: ["foo", "faa"] });
  expected = ["foo", "faa"];
  assert.deepEqual(
    actual,
    expected,
    "should return an array of examples when given examples object array"
  );

  actual = pugDocParser.getExamples({ example: [], examples: [] });
  expected = [];
  assert.deepEqual(
    actual,
    expected,
    "should return an empty array of examples when given empty examples object array"
  );

  assert.end();
});

/**
 * Pug
 */

test("Pug", function (assert) {
  let src = fs.readFileSync("./test/fixtures/pug.pug").toString();

  let actual = pugDocParser.getPugdocDocuments(src, "test.pug")[0].output;
  let expected = '<div class="beep boop-biip">biip</div>';
  assert.equal(actual, expected);

  assert.end();
});

/**
 * Indented block
 * https://github.com/Aratramba/pug-doc/issues/43
 */

test("indented block", function (assert) {
  let stream = pugDoc({
    input: ["./test/fixtures/indent.pug"],
  });

  stream.on("data", function (data) {
    let actual = data.source;
    let expected = "div\n  div\n    div\n      p foo";
    assert.equal(actual, expected, "Source code block should be correct");

    actual = data.output;
    expected = "<div><div><div><p>foo</p></div></div></div>";
    assert.equal(actual, expected, "Its html output should be correct");

    assert.end();
  });
});

/**
 * Locals
 * https://github.com/Aratramba/pug-doc/issues/44
 */

test("Locals", function (assert) {
  assert.plan(3);
  let src = fs.readFileSync("./test/fixtures/locals.pug").toString();

  // test local
  let actual = pugDocParser.getPugdocDocuments(src, "locals.pug")[0].output;
  let expected = "<div>local\n</div>";
  assert.equal(actual, expected);

  // add global
  actual = pugDocParser.getPugdocDocuments(src, "locals.pug", {
    globalVar: "global",
  })[0].output;
  expected = "<div>local\nglobal</div>";
  assert.equal(actual, expected);

  // don't overwrite local
  actual = pugDocParser.getPugdocDocuments(src, "locals.pug", {
    localVar: "global",
  })[0].output;
  expected = "<div>local\n</div>";
  assert.equal(actual, expected);
});

/**
 * Whitespace
 * https://github.com/Aratramba/pug-doc/issues/41
 */

test("Whitespace", function (assert) {
  assert.plan(1);
  let src = fs.readFileSync("./test/fixtures/whitespace.pug").toString();

  // test local
  let actual = pugDocParser.getPugdocDocuments(src, "41.pug")[0].output;
  let expected = "<div>fooo faa\nfooo faa\nfooo faa</div>";
  assert.equal(actual, expected);
});

/**
 * Capture
 * https://github.com/Aratramba/pug-doc/issues/45
 */

test("Capture", function (assert) {
  let src = fs.readFileSync("./test/fixtures/capture.pug").toString();

  let doc = pugDocParser.getPugdocDocuments(src, "45.pug");

  let actual = doc[0].output;
  let expected = "<div>1</div><div>2</div><div>3</div>";
  assert.deepEqual(actual, expected);

  actual = doc[1].output;
  expected = "<div>1 section</div><div>2 section</div><div>3 section</div>";
  assert.deepEqual(actual, expected);

  actual = doc[2].output;
  expected = "<div>4 section</div><div>5 section</div><div>6 section</div>";
  assert.deepEqual(actual, expected);

  actual = doc[3].output;
  expected = "<div>4 section</div><div>5 section</div><div>6 section</div>";
  assert.deepEqual(actual, expected);

  actual = doc[4].output;
  expected = "<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>";
  assert.deepEqual(actual, expected);

  assert.end();
});

/**
 * Example
 * https://github.com/Aratramba/pug-doc/issues/46
 */

test("Examples", function (assert) {
  let src = fs.readFileSync("./test/fixtures/examples.pug").toString();

  let doc = pugDocParser.getPugdocDocuments(
    src,
    "./test/fixtures/examples.pug"
  );

  let actual = doc[0].output;
  let expected = '<div class="example"><p>this is my example</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[1].output;
  expected =
    '<div class="example"><p>this is my example</p><p>this is my example</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[2].output;
  expected =
    '<div class="example"></div><p>this is my example</p><div class="example"></div>';
  assert.deepEqual(actual, expected);

  actual = doc[3].output;
  expected = '<div class="example"></div>';
  assert.deepEqual(actual, expected);

  actual = doc[4].output;
  expected = '<div class="block"></div>';
  assert.deepEqual(actual, expected);

  actual = doc[5].output;
  expected = "<notblock></notblock><p>this is my example</p>";
  assert.deepEqual(actual, expected);

  actual = doc[6].output;
  expected = '<div class="example"><p>this is my example</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[7].output;
  expected =
    '<div class="example1"><p>this is my example</p></div><div class="example2"><p>this is my example</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[8].output;
  expected = '<div class="example"><div><p>this is my example</p></div></div>';
  assert.deepEqual(actual, expected);

  actual = doc[9].output;
  expected =
    '<div class="example"><p>section 1</p><p>section 2</p></div><div class="example"><p>section 1</p><p>section 2</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[10].output;
  expected = "foo";
  assert.deepEqual(actual, expected);

  actual = doc[11].output;
  expected = "foo";
  assert.deepEqual(actual, expected);

  actual = doc[12].output;
  expected =
    "<div>this is a mixin foo</div><div>this is the same mixin faa</div>";
  assert.deepEqual(actual, expected);

  assert.end();
});

/**
 * Example
 * https://github.com/Aratramba/pug-doc/issues/53
 */

test("Examples objects", function (assert) {
  let src = fs.readFileSync("./test/fixtures/examples-objects.pug").toString();

  let doc = pugDocParser.getPugdocDocuments(
    src,
    "./test/fixtures/examples-objects.pug"
  );

  let actual = doc[0].output;
  let expected =
    '<div class="example1a"><p>this is my example</p></div><div class="example1b"><p>this is my example</p></div><div class="example2"><p>this is my example</p></div><div class="example3"><p>this is my example</p></div><div class="example4"><p>this is my example</p></div>';
  assert.deepEqual(actual, expected);

  actual = doc[0].fragments.length;
  expected = 3;
  assert.deepEqual(actual, expected);

  actual = doc[0].fragments[0];
  expected = {
    meta: {
      description: "description 1",
      examples: ["div.example1a\n  block\n", "div.example1b\n  block\n"],
      name: "Examples (1)",
    },
    output:
      '<div class="example1a"><p>this is my example</p></div><div class="example1b"><p>this is my example</p></div>',
  };
  assert.deepEqual(actual, expected);

  actual = doc[0].fragments[1];
  expected = {
    meta: {
      description: "description 3",
      example: ["div.example3\n  block\n"],
      name: "Examples (3)",
    },
    output: '<div class="example3"><p>this is my example</p></div>',
  };
  assert.deepEqual(actual, expected);

  actual = doc[0].fragments[2];
  expected = {
    meta: {
      description: "description 4",
      example: "div.example4\n  block\n",
      name: "Examples (4)",
    },
    output: '<div class="example4"><p>this is my example</p></div>',
  };
  assert.deepEqual(actual, expected);

  assert.end();
});

/**
 * Test stderr output when pug compilation fails
 */

test("Error", function (assert) {
  let src = fs.readFileSync("./test/fixtures/error.pug").toString();
  let doc = pugDocParser.getPugdocDocuments(src, "./test/fixtures/error.pug");

  let actual = doc[0];
  let expected = null;
  assert.deepEqual(actual, expected);

  let spawn = require("tape-spawn");
  let st = spawn(assert, "./cli.js test/fixtures/error.pug");
  st.stderr.match(`TypeError: ${process.cwd()}/test/fixtures/error.pug:2
    1| mixin error-mixin()
  > 2|   +error
    3| +error-mixin()

pug_mixins.error is not a function`);
  st.end();
});
