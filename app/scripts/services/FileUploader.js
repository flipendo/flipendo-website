'use strict';
/* global app */

app.factory('fileUploader', function() {
  var progress = 30;
  var chunks = [];
  var status = 'pending';

  var done = function() {
    this.status = 'done';
  };

  var upload = function() {

  };

  return {
    progress: progress,
    chunks: chunks,
    status: status,
    done: done,
    upload: upload
  };
});