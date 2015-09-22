'use strict';
/* globals module */

/**
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L245
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L625
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L498
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L407
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L438
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L438
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L420
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L589
 * https://github.com/jadejs/jade-lexer/blob/master/index.js#L200
 */

module.exports = {
  TYPES: {
    MIXIN: {
      label: 'mixin',
      regex: /^mixin +([-\w]+)(?: *\((.*)\))?/
    },
    INCLUDE: {
      label: 'include',
      regex: /^include +([^\n]+)/
    },
    EXTENDS: {
      label: 'extends',
      regex: /^extends? +([^\n]+)/
    },
    BLOCK: {
      label: 'block',
      regex: /^block\b *(?:(prepend|append) +)?([^\n]+)/
    },
    APPEND: {
      label: 'block-append',
      regex: /^append +([^\n]+)/
    },
    PREPEND: {
      label: 'block-prepend',
      regex: /^prepend +([^\n]+)/
    },
    TAG: {
      label: 'tag',
      regex: /^(\w(?:[-:\w]*\w)?)(\/?)/
    },
    COMMENT: {
      label: 'comment',
      regex: /^\/\/(-)?([^\n]*)/
    },
    EMPTY_LINE: {
      label: 'empty-line',
      regex: /^\s*$/
    }
  },
  MIXIN_CALL_REGEX: /\+([-\w]+) */g,
  MIXIN_CALL_REGEX_WITH_ARGUMENTS: /\+([-\w]+)(?: *\((.*)\))? */g
};