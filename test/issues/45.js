'use strict';
/* global require */

var getPugdocDocuments = require('../../lib/parser').getPugdocDocuments;
var fs = require('fs');

var source = fs.readFileSync('./test/issues/45.jade', 'utf8');

var result = getPugdocDocuments(source, '45.jade')