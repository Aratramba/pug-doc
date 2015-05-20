'use strict';
/* globals require */

var rimraf = require('rimraf');
rimraf.sync('./test/tmp');

var JadeDoc = require('../index');
new JadeDoc({
  input: './test/fixtures/**/*.jade',
  output: './test/tmp/all.json'
});