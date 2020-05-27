#!/usr/bin/env node

const meow = require("meow");
const pugDoc = require("./index");
const JSONStream = require("JSONStream");

const cli = meow(`
    "Usage",
    "  $ pug-doc input.pug --output output.json",
    "",
    "Options",
    "  --output    Set output json file"
    "  --silent    No terminal output"
  `);

console.time("Finished Pug-doc");

const pd = new pugDoc({
  input: cli.input[0],
  output: cli.flags.output,
  useCache: Boolean(cli.flags.useCache),
});

const stream = process.stdin.pipe(pd).pipe(JSONStream.stringify());

if (!cli.flags.silent) {
  stream.pipe(process.stdout);
}

pd.on("complete", function () {
  console.log("");
  console.timeEnd("Finished Pug-doc");
  process.exit();
});

if (!cli.flags.output) {
  pd.on("end", function () {
    process.exit();
  });
}
