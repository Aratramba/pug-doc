'use strict';
/* globals exports, require */

var docs;

exports.docs = {

  setUp: function(done) {
    docs = require('../index');
    done();
  },


  /**
   * Generate docs JSON
   */

  generate_docs: function(test) {
    test.expect(1);

    var options = {
      input: './test/fixtures/arguments.jade',
      outputFile: './test/tmp/docs.json',
      keyword: '@jadedoc'
    };
    docs.generate(options);

    test.ok(1);
    test.done();
  }
};
