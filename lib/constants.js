'use strict';
/* globals module */

module.exports = {
  TYPE_NODE: 'node',
  TYPE_MIXIN: 'mixin',
  TYPE_INCLUDE: 'include',
  TYPE_NONE: 'standalone-comment',
  MIXIN_CALL_REGEX: /\+([-\w]+) */g,
  MIXIN_CALL_REGEX_WITH_ARGUMENTS: /\+([-\w]+)(?: *\((.*)\))? */g
};