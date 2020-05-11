const doctrine = require("doctrine");
const doctrineSyntax = doctrine.Syntax;
const codeBlock = require("indented-code-block");

const TYPE_MAPPING = {};
TYPE_MAPPING[doctrineSyntax.RecordType] = "Object";

const NAME_REGEX = /(\s|\[|^)(\w+((-+|\.)\w+)*)($|\s+?|\-|=|\]).*$/;

/**
 * Get JSDoc type
 */

function getJSDocType(tag) {
  const type = tag.type;

  if (type) {
    if (type.elements) {
      return type.elements.map(function (item) {
        return item.name;
      });
    }

    if (type.name) {
      return type.name;
    }

    if (type.expression) {
      return type.expression.name;
    }

    if (type.type) {
      return TYPE_MAPPING[type.type] || type.type;
    }

    return type;
  }

  return "";
}

/**
 * Check if param is nullable
 */

function getJSDocNullable(tag) {
  if (tag && tag.type && tag.type.type) {
    return tag.type.type === doctrineSyntax.NullableType;
  }
  return false;
}

/**
 * Check if param is optional
 */

function getJSDocOptional(tag) {
  if (tag && tag.type && tag.type.type) {
    return tag.type.type === doctrineSyntax.OptionalType;
  }
  return false;
}

/**
 * Escape the name part so it is
 * recognized as a name value by jsdoc.
 * This is needed because in pug 'data-foo'
 * is a valid attribute, but that's not a
 * valid jsdoc name.
 * https://github.com/Aratramba/pug-doc/issues/39
 */

function getJSDocName(str) {
  return NAME_REGEX.exec(str)[2];
}

/**
 * Parse param string
 */

function parseJSDocParam(str, escapeName) {
  const original = str;
  let name;
  if (escapeName) {
    name = getJSDocName(str);
    str = str.replace(name, name.replace("-", "_", "g"));
  }

  const tag = getJSDocParamAst(str);

  if (!tag) {
    return null;
  }

  const param = {
    name: name || tag.name || "",
    description: tag.description || "",
    type: getJSDocType(tag),
    default: tag.default || null,
    nullable: getJSDocNullable(tag),
    optional: getJSDocOptional(tag),
    original: original,
  };

  return param;
}

/**
 * Get JSDoc param ast by parsing '* param ...' with doctrine
 */

function getJSDocParamAst(str) {
  const ast = doctrine.parse("* @param " + str, {
    unwrap: true,
    tags: ["param"],
    sloppy: true,
  });

  if (!ast.tags.length) {
    return null;
  }

  return ast.tags[0];
}

/**
 * Wrap arguments list items in quotes to be able
 * to use jsdoc like `{type} foo - foo`.
 * The {} are special yaml characters so the
 * jsdoc string needs to be escaped with quotes.
 */

function escapeArgumentsYAML(str, needle) {
  let argsBlock = codeBlock.byString(str, needle);
  if (Array.isArray(argsBlock)) {
    argsBlock = argsBlock[0];
  }

  const escapedArgsBlock = argsBlock.replace(/([\s].-[\s+]?)(.*)/gi, function (
    match,
    p1,
    p2
  ) {
    return [p1, '"', p2, '"'].join("");
  });
  str = str.replace(argsBlock, escapedArgsBlock);
  return str;
}

module.exports = {
  getType: getJSDocType,
  isOptional: getJSDocOptional,
  isNullable: getJSDocNullable,
  parse: parseJSDocParam,
  getAst: getJSDocParamAst,
  escapeArgumentsYAML: escapeArgumentsYAML,
  getJSDocName: getJSDocName,
};
