const test = require("tape");
const fs = require("fs");
const pugDocParser = require("../lib/parser");
const stripAnsi = require("strip-ansi");

/**
 * Test error output when pug compilation fails
 */

test("Error", function (assert) {
  let src = fs.readFileSync("./test/fixtures/error.pug").toString();

  let messages = [];
  pugDocParser.getPugdocDocuments(
    src,
    "./test/fixtures/error.pug",
    {},
    {},
    {
      log: (msg) => {
        messages.push(stripAnsi(msg));
      },
    }
  );

  let actual = messages[0];
  let expected = "error-mixin";
  assert.deepEqual(actual, expected, "name should be visible on error");

  actual = messages[1];
  expected = `error: {
  "name": "error-mixin",
  "examples": [
    "+error-mixin()"
  ]
}`;
  assert.deepEqual(actual, expected, "pugdoc should be visible on error");

  actual = messages[2];
  expected = `
TypeError: ./test/fixtures/error.pug:2
    1| mixin error-mixin()
  > 2|   +error
    3| +error-mixin()

pug_mixins.error is not a function
`;
  assert.deepEqual(actual, expected, "pug error should be visible");
  assert.end();
});
