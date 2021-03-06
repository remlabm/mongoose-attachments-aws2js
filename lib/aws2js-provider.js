// Copyright (c) 2011-2013 Firebase.co - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var attachments = require('mongoose-attachments');
// var s3 = require('aws2js').load('s3');
var AWS = require('aws-sdk');
var util = require('util');
var fs = require('fs');

function S3Storage(options) {
  attachments.StorageProvider.call(this, options);

  var s3 = new AWS.S3( {
    accessKeyId: options.key,
    secretAccessKey: options.secret,
    region: options.region
  });

  this.options = options || {};

  // s3.setCredentials( options.key, options.secret );
  // s3.setBucket( options.bucket );

  this.acl = options.acl || 'private';
  this.client = s3;
  this.endpoint = options.endpoint || ( 'https://' + options.bucket + '.s3.amazonaws.com' );
}
util.inherits(S3Storage, attachments.StorageProvider);

S3Storage.prototype.getUrl = function( path ){
  return this.endpoint + '/' + path;
};

S3Storage.prototype.createOrReplace = function(attachment, cb) {
  var self = this;

  var fileBuffer = fs.readFileSync( attachment.filename );

  this.client.putObject({
    Bucket: self.options.bucket,
    Key: attachment.path,
    ACL: self.acl,
    Body: fileBuffer,
    ContentLength: attachment.stats.size,
    ContentType: 'image/jpeg'
  }, function(err, uploadRes) {
    if(err) return cb(err);
    attachment.defaultUrl = self.getUrl( attachment.path );
    cb(null, attachment);
  });
  // this.client.putFile(attachment.path,attachment.filename, self.acl, {}, function(err, uploadRes) {
  //   if(err) return cb(err);
  //   attachment.defaultUrl = self.getUrl( attachment.path );
  //   cb(null, attachment);
  // });
};

// register the S3 Storage Provider into the registry
attachments.registerStorageProvider('aws-sdk', S3Storage);

// export attachments so there is no need for an explicit require of it
module.exports = attachments;
