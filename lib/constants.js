'use strict';
/* globals module */

module.exports = {
  TYPE_NODE: 'node',
  TYPE_MIXIN: 'mixin',
  TYPE_INCLUDE: 'include',
  TYPE_EXTENDS: 'extends',
  TYPE_BLOCK: 'block',
  TYPE_BLOCK_APPEND: 'block-append',
  TYPE_BLOCK_PREPEND: 'block-prepend',
  TYPE_NONE: 'standalone-comment',
  MIXIN_CALL_REGEX: /\+([-\w]+) */g,
  MIXIN_CALL_REGEX_WITH_ARGUMENTS: /\+([-\w]+)(?: *\((.*)\))? */g
};