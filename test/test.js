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

  block: function(test) {
    this.JadeDoc(getOptions('block', test));
  },

  comments: function(test) {
    this.JadeDoc(getOptions('comments', test));
  },

  extends: function(test) {
    this.JadeDoc(getOptions('extends', test));
  },

  mixins: function(test) {
    this.JadeDoc({
      input: './test/fixtures/mixins*.jade',
      output: './test/tmp/mixins.json',
      keyword: '@jadedoc',
      complete: function(){
        var tmp = require('./tmp/mixins.json');
        var expected = require('./expected/mixins.json');     
        test.deepEqual(tmp, expected);
        test.done();
      }
    }, test);
  },

  include: function(test) {
    this.JadeDoc(getOptions('include', test));
  },
  
  tag: function(test) {
    this.JadeDoc(getOptions('tag', test));
  },
  
  empty_line: function(test) {
    this.JadeDoc(getOptions('empty-line', test));
  },
};
