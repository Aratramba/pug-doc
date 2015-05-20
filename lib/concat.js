'use strict';
/* globals require, module, Buffer */

var async = require('async');
var fs = require('fs');
var settings = require('./settings');

function concat(files, cb){
  async.waterfall([
    async.apply(read, files),
    async.apply(write)
  ], function(data){
    cb(data.toString());
  });
}

function write(buffers, cb){
  cb(Buffer.concat(buffers));
}

function read(files, cb){
  async.mapSeries(files, readFile, cb);

  function readFile(file, cb){
    fs.readFile(file, function(err, data){
      data = Buffer.concat([new Buffer('//- '+ settings.get().keyword +'-file \''+ file +'\'\n'), data, new Buffer('\n\n\n')]);
      cb(err, data);
    });
  }
}

module.exports = concat;