const fs = require("fs");
const pugDoc = require("../index");
const pugDocParser = require("../lib/parser");

// pugDoc({
//   input: ["./test/fixtures/examples-objects.pug"],
// });

const src = fs.readFileSync("./test/fixtures/example-boolean.pug").toString();
const doc = pugDocParser.getPugdocDocuments(
  src,
  "./test/fixtures/example-boolean.pug"
);

console.log("---");
console.log(doc);
