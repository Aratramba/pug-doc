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
      inputDirectory: './test/fixtures/',
      outputFile: './test/tmp/docs.json'
    };
    docs.generate(options);

    test.ok(1);
    test.done();
  }
};
