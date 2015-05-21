'use strict';
/* globals exports, require */

var rimraf = require('rimraf');

// clean tmp
rimraf.sync('./test/tmp');

function getOptions(name, test){
  test.expect(1);

  return {
    input: './test/fixtures/'+ name +'.jade',
    output: './test/tmp/'+ name +'.json',
    keyword: '@jadedoc',
    complete: function(){
      var tmp = require('./tmp/'+ name +'.json');
      var expected = require('./expected/'+ name +'.json');     
      test.deepEqual(tmp, expected);
      test.done();
    }
  };
}


exports.docs = {

  setUp: function(cb){
    this.JadeDoc = require('../index');
    cb();
  },

  node: function(test) {
    this.JadeDoc(getOptions('node', test));
  },

  include: function(test) {
    this.JadeDoc(getOptions('include', test));
  },

  only_doc: function(test) {
    this.JadeDoc(getOptions('only-doc', test));
  },

  mixins: function(test) {
    this.JadeDoc(getOptions('mixins', test));
  },

  comments: function(test) {
    this.JadeDoc(getOptions('comments', test));
  }
};
