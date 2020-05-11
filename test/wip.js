const fs = require("fs");
const pugDoc = require("../index");
const pugDocParser = require("../lib/parser");

const src = fs.readFileSync("./test/fixtures/wrap.pug").toString();
const doc = pugDocParser.getPugdocDocuments(src, "./test/fixtures/wrap.pug");
console.log("---");

console.log(doc);
