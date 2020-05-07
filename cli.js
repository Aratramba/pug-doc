#!/usr/bin/env node
"use strict";

const meow = require("meow");
const pugDoc = require("./index");
const JSONStream = require("JSONStream");

const cli = meow(`
    "Usage",
    "  $ pug-doc input.jade --output output.json",
    "",
    "Options",
    "  --output    Set output json file"
  `);

const pd = new pugDoc({
  input: cli.input[0],
  output: cli.flags.output,
});

process.stdin.pipe(pd).pipe(JSONStream.stringify()).pipe(process.stdout);

pd.on("complete", function () {
  process.exit();
});

if (!cli.flags.output) {
  pd.on("end", function () {
    process.exit();
  });
}
