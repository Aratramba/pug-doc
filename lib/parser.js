const pug = require("pug");
const pugRuntimeWrap = require("pug-runtime/wrap");

const path = require("path");
const YAML = require("js-yaml");
const getCodeBlock = require("pug-code-block");
const detectIndent = require("detect-indent");
const rebaseIndent = require("rebase-indent");
const pugdocArguments = require("./arguments");

const MIXIN_NAME_REGEX = /^mixin +([-\w]+)?/;
const DOC_REGEX = /^\s*\/\/-\s+?\@pugdoc\s*$/;
const DOC_STRING = "//- @pugdoc";
const CAPTURE_ALL = "all";
const CAPTURE_SECTION = "section";
const EXAMPLE_BLOCK = "block";

/**
 * Returns all pugdoc comment and code blocks for the given code
 *
 * @param templateSrc {string}
 * @return {{lineNumber: number, comment: string, code: string}[]}
 */

function extractPugdocBlocks(templateSrc) {
  return (
    templateSrc
      .split("\n")
      // Walk through every line and look for a pugdoc comment
      .map(function (line, lineIndex) {
        // If the line does not contain a pugdoc comment skip it
        if (!line.match(DOC_REGEX)) {
          return undefined;
        }

        // If the line contains a pugdoc comment return
        // the comment block and the next code block
        const comment = getCodeBlock.byLine(templateSrc, lineIndex + 1);
        const meta = parsePugdocComment(comment);

        // add number of captured blocks
        if (meta.capture <= 0) {
          return undefined;
        }

        let capture = 2;
        if (meta.capture) {
          if (meta.capture === CAPTURE_ALL) {
            capture = Infinity;
          } else if (meta.capture === CAPTURE_SECTION) {
            capture = Infinity;
          } else {
            capture = meta.capture + 1;
          }
        }

        // get all code blocks
        let code = getCodeBlock.byLine(templateSrc, lineIndex + 1, capture);

        // make string
        if (Array.isArray(code)) {
          // remove comment
          code.shift();

          // join all code
          code = code.join("\n");
        } else {
          return undefined;
        }

        // filter out all but current pugdoc section
        if (meta.capture === CAPTURE_SECTION) {
          const nextPugDocIndex = code.indexOf(DOC_STRING);
          if (nextPugDocIndex > -1) {
            code = code.substr(0, nextPugDocIndex);
          }
        }

        // if no code and no comment, skip
        if (comment.match(DOC_REGEX) && code === "") {
          return undefined;
        }

        return {
          lineNumber: lineIndex + 1,
          comment: comment,
          code: code,
        };
      })
      // Remove skiped lines
      .filter(function (result) {
        return result !== undefined;
      })
  );
}

/**
 * Returns all pugdocDocuments for the given code
 *
 * @param templateSrc {string}
 * @param filename {string}
 */

function getPugdocDocuments(templateSrc, filename, locals) {
  return extractPugdocBlocks(templateSrc).map(function (pugdocBlock) {
    const meta = parsePugdocComment(pugdocBlock.comment);
    const fragments = [];

    // parse jsdoc style arguments list
    if (meta.arguments) {
      meta.arguments = meta.arguments.map(function (arg) {
        return pugdocArguments.parse(arg, true);
      });
    }

    // parse jsdoc style attributes list
    if (meta.attributes) {
      meta.attributes = meta.attributes.map(function (arg) {
        return pugdocArguments.parse(arg, true);
      });
    }

    let source = pugdocBlock.code;
    source = source.replace(/\u2028|\u200B/g, "");

    if (meta.example && meta.example !== false) {
      if (meta.beforeEach) {
        meta.example = `${meta.beforeEach}\n${meta.example}`;
      }
      if (meta.afterEach) {
        meta.example = `${meta.example}\n${meta.afterEach}`;
      }
    }

    // get example objects and add them to parent example
    // also return them as separate pugdoc blocks
    if (meta.examples) {
      for (let i = 0, l = meta.examples.length; i < l; ++i) {
        let x = meta.examples[i];

        // do nothing for simple examples
        if (typeof x === "string") {
          if (meta.beforeEach) {
            meta.examples[i] = `${meta.beforeEach}\n${x}`;
          }
          if (meta.afterEach) {
            meta.examples[i] = `${x}\n${meta.afterEach}`;
          }
          continue;
        }

        if (meta.beforeEach && typeof x.beforeEach === "undefined") {
          x.example = `${meta.beforeEach}\n${x.example}`;
        }

        if (meta.afterEach && typeof x.afterEach === "undefined") {
          x.example = `${x.example}\n${meta.afterEach}`;
        }

        // merge example/examples with parent examples
        meta.examples[i] = getExamples(x).reduce(
          (acc, val) => acc.concat(val),
          []
        );

        // add fragments
        fragments.push(x);
      }

      meta.examples = meta.examples.reduce((acc, val) => acc.concat(val), []);
    }

    // fix pug compilation for boolean use of example
    const exampleClone = meta.example;
    if (typeof meta.example === "boolean") {
      meta.example = "";
    }

    const obj = {
      // get meta
      meta: meta,
      // add file path
      file: path.relative(".", filename),
      // get pug code block matching the comments indent
      source: source,
      // get html output
      output: compilePug(source, meta, filename, locals),
    };

    // remove output if example = false
    if (exampleClone === false) {
      obj.output = null;
    }

    // add fragments
    if (fragments && fragments.length) {
      obj.fragments = fragments.map((subexample) => {
        return {
          // get meta
          meta: subexample,
          // get html output
          output: compilePug(source, subexample, filename, locals),
        };
      });
    }

    if (obj.output || obj.fragments) {
      return obj;
    }

    return null;
  });
}

/**
 * Extract pug attributes from comment block
 */

function parsePugdocComment(comment) {
  // remove first line (@pugdoc)
  if (comment.indexOf("\n") === -1) {
    return {};
  }

  comment = comment.substr(comment.indexOf("\n"));
  comment = pugdocArguments.escapeArgumentsYAML(comment, "arguments");
  comment = pugdocArguments.escapeArgumentsYAML(comment, "attributes");

  // parse YAML
  return YAML.safeLoad(comment) || {};
}

/**
 * get all examples from the meta object
 * either one or both of meta.example and meta.examples can be given
 */

function getExamples(meta) {
  let examples = [];
  if (meta.example) {
    examples = examples.concat(meta.example);
  }
  if (meta.examples) {
    examples = examples.concat(meta.examples);
  }
  return examples;
}

/**
 * Compile Pug
 */

function compilePug(src, meta, filename, locals) {
  let newSrc = [src];

  // add example calls
  getExamples(meta).forEach(function (example, i) {
    // append to pug if it's a mixin example
    if (MIXIN_NAME_REGEX.test(src)) {
      newSrc.push(example);

      // replace example block with src
    } else {
      if (i === 0) {
        newSrc = [];
      }

      const lines = example.split("\n");
      lines.forEach(function (line) {
        if (line.trim() === EXAMPLE_BLOCK) {
          const indent = detectIndent(line).indent.length;
          line = rebaseIndent(src.split("\n"), indent).join("\n");
        }
        newSrc.push(line);
      });
    }
  });

  newSrc = newSrc.join("\n");

  locals = Object.assign({}, locals, meta.locals);

  // compile pug
  const compiled = pug.compileClient(newSrc, {
    name: "tmp",
    externalRuntime: true,
    filename: filename,
  });

  try {
    const templateFunc = pugRuntimeWrap(compiled, "tmp");
    return templateFunc(locals || {});
  } catch (err) {
    try {
      const compiledDebug = pug.compileClient(newSrc, {
        name: "tmp",
        externalRuntime: true,
        filename: filename,
        compileDebug: true,
      });
      const templateFuncDebug = pugRuntimeWrap(compiledDebug, "tmp");
      templateFuncDebug(locals || {});
    } catch (debugErr) {
      process.stderr.write(
        `\n\nPug-doc error: ${JSON.stringify(meta, null, 2)}`
      );
      process.stderr.write(`\n\n${debugErr.toString()}`);
      return null;
    }
  }
}

// Exports
module.exports = {
  extractPugdocBlocks: extractPugdocBlocks,
  getPugdocDocuments: getPugdocDocuments,
  parsePugdocComment: parsePugdocComment,
  getExamples: getExamples,
};
