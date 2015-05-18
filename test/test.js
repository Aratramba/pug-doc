'use strict';
/* globals exports, require */

var rimraf = require('rimraf');

// clean tmp
rimraf.sync('./test/tmp');

exports.docs = {


  /**
   * Simple jade node
   */

  node: function(test) {
    var JadeDoc = require('../index');
    var fileName = 'node';
    test.expect(1);

    var options = {
      input: './test/fixtures/'+ fileName +'.jade',
      output: './test/tmp/'+ fileName +'.json',
      keyword: '@jadedoc'
    };

    new JadeDoc(options, function(){
      var tmp = require('./tmp/'+ fileName +'.json');
      var expected = require('./expected/'+ fileName +'.json');      
      test.deepEqual(tmp, expected);
      test.done();
    });
  },


  /**
  * Include
  */
   

  include: function(test) {
    var JadeDoc = require('../index');
    var fileName = 'include';
    test.expect(1);

    var options = {
      input: './test/fixtures/'+ fileName +'.jade',
      output: './test/tmp/'+ fileName +'.json',
      keyword: '@jadedoc'
    };

    new JadeDoc(options, function(){
      var tmp = require('./tmp/'+ fileName +'.json');
      var expected = require('./expected/'+ fileName +'.json');      
      test.deepEqual(tmp, expected);
      test.done();
    });
  },


  /**
   * Only comment doc
   */

  only_doc: function(test) {
    var JadeDoc = require('../index');
    var fileName = 'only-doc';
    test.expect(1);

    var options = {
      input: './test/fixtures/'+ fileName +'.jade',
      output: './test/tmp/'+ fileName +'.json',
      keyword: '@jadedoc'
    };

    new JadeDoc(options, function(){
      var tmp = require('./tmp/'+ fileName +'.json');
      var expected = require('./expected/'+ fileName +'.json');      
      test.deepEqual(tmp, expected);
      test.done();
    });
  },


  /**
   * Mixins
   */

  mixins: function(test) {
    var JadeDoc = require('../index');
    var fileName = 'mixins';
    test.expect(1);

    var options = {
      input: './test/fixtures/'+ fileName +'.jade',
      output: './test/tmp/'+ fileName +'.json',
      keyword: '@jadedoc'
    };

    new JadeDoc(options, function(){
      var tmp = require('./tmp/'+ fileName +'.json');
      var expected = require('./expected/'+ fileName +'.json');      
      test.deepEqual(tmp, expected);
      test.done();
    });
  },


  /**
   * All
   */

  all: function(test) {
    var JadeDoc = require('../index');
    var fileName = 'all';
    test.expect(1);

    var options = {
      input: './test/fixtures/**/*.jade',
      output: './test/tmp/'+ fileName +'.json',
      keyword: '@jadedoc'
    };

    new JadeDoc(options, function(){
      var tmp = require('./tmp/'+ fileName +'.json');
      var expected = require('./expected/'+ fileName +'.json');      
      test.deepEqual(tmp, expected);
      test.done();
    });
  }
};
