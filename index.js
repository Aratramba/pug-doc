"use strict";
/* globals require, module */

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const through2 = require("through2");
const assign = require("object-assign");
const fileRegister = require("text-file-register");
const parser = require("./lib/parser.js");

/**
 * Pug Documentation generator
 * returns a JSON stream
 * optionally writes a JSON array containing
 * all docs to an output file.
 */

function pugDoc(options) {
  if (typeof options === "undefined") {
    throw new Error("Pug doc requires a settings object.");
  }

  if (typeof options.input === "undefined") {
    throw new Error("Pug doc requires settings.input to be set.");
  }

  // options
  options = assign(
    {
      input: null,
      output: null,
      locals: {},
      complete: function () {},
    },
    options
  );

  let counter = 0;

  // register files
  const register = fileRegister();
  register.addFiles(options.input, init);

  // create readable stream
  const stream = through2(
    { objectMode: true },
    function (chunk, enc, next) {
      this.push(chunk);
      next();
    },
    function (cb) {
      cb();
    }
  );

  let output;

  /**
   * Init
   */

  function init() {
    // write stream to output file
    if (options.output) {
      // create directory if it doesn't exist
      mkdirp.sync(path.dirname(options.output));

      // create writable stream
      output = fs.createWriteStream(options.output);
      output.write("[");

      output.on("close", function () {
        stream.emit("complete");
      });

      output.on("finish", function () {
        if (options.complete && typeof options.complete === "function") {
          options.complete();
        }
      });
    }

    // get all pug files
    const files = register.getAll();
    let file;

    // collect docs for all files
    for (file in files) {
      let pugDocDocuments = parser.getPugdocDocuments(
        files[file],
        file,
        options.locals
      );
      pugDocDocuments
        .filter(function (docItem) {
          return Boolean(docItem);
        })
        .forEach(function (docItem) {
          // omit first comma
          if (counter !== 0 && options.output) {
            output.write(",");
          }
          // add object to stream
          stream.push(docItem);
          if (options.output) {
            // send to output
            output.write(JSON.stringify(docItem));
          }
          // up counter
          ++counter;
        });
    }

    // end json array stream
    if (options.output) {
      output.write("]");
      output.end();
    } else {
      if (options.complete && typeof options.complete === "function") {
        options.complete();
      }
    }

    // end stream
    stream.push(null);
  }

  return stream;
}

module.exports = pugDoc;
