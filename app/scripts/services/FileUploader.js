'use strict';
/* global app, API_URL, io */

app.factory('fileUploader', ['$rootScope', '$location', 'Upload', function($rootScope, $location, Upload) {
  var FileUploader = function() {
    this.id = '';
    this.progress = 0;
    this.chunks = [];
    this.computedChunks = [];
    this.status = 'waiting';
    this.error = '';
    this.socket = null;

    this.done = function() {
      this.status = 'done';
    };

    this.openSocket = function(id) {
      this.socket = io.connect(API_URL+'/'+id);

      return this.socket;
    };

    this.initComputedChunks = function() {
      for(var i = 0; i < 64 && i < this.chunks.length; i++) {
        var chunk = {};

        for (var k in this.chunks[i]) {
          chunk[k] = this.chunks[i][k];
        }
        this.computedChunks.push(chunk);
        this.updateComputedChunk(i);
      }
    };

    function colourGradientor(p, rgbBeginning, rgbEnd) {
      var w = p * 2 - 1;
      var w1 = (w + 1) / 2.0;
      var w2 = 1 - w1;
      var rgb = [parseInt(rgbBeginning[0] * w1 + rgbEnd[0] * w2),
          parseInt(rgbBeginning[1] * w1 + rgbEnd[1] * w2),
              parseInt(rgbBeginning[2] * w1 + rgbEnd[2] * w2)];
      return rgb;
    }

    this.updateComputedChunk = function(i) {
      i = i % 64;
      var j = i;
      var nbr = 0;
      this.computedChunks[i].done = true;
      this.computedChunks[i].nbrDone = 0;
      while (j < this.chunks.length) {
        if (this.chunks[j].error) {
          this.computedChunks[i].error = this.chunks[j].error;
        }
        if (this.chunks[j].done === false) {
          this.computedChunks[i].done = false;
        } else {
          this.computedChunks[i].nbrDone++;
        }
        j += 64;
        nbr++;
      }
      this.computedChunks[i].nbr = nbr;

      var baseColor = [214, 218, 220];
      var doneColor = [191, 4, 4];

      var color = colourGradientor(1.0 - this.computedChunks[i].nbrDone / nbr, baseColor, doneColor);
      this.computedChunks[i].color = '#'+ color[0].toString(16) + color[1].toString(16) + color[2].toString(16);
    };

    this.refreshChunksProgress = function() {
      var done = 0;
      for (var i in this.chunks) {
        if (this.chunks[i].error) {
          this.error = this.chunks[i].error;
        }
        if (this.chunks[i].done) {
          done++;
        }
      }
      this.progress = parseInt(100 * done / this.chunks.length);
      $rootScope.$digest();
    };

    this.upload = function(files) {
      if (files && files.length) {
        var self = this;
        Upload.upload({
          url: API_URL+'/upload',
          file: files[0]
        }).progress(function(evt) {
          self.progress = parseInt(100.0 * evt.loaded / evt.total);
        }).success(function(data, s, headers, config) {
          /* jshint unused: false */
          if (s === 200) {
            self.status = 'pending';
            $location.path('/'+data.id);
          } else {
            self.status = 'error';
            self.error = data.error;
          }
          self.progress = 0;
        }).error(function() {
          self.status = 'error';
          self.progress = 0;
        });
        this.status = 'uploading';
      }
    };

    this.initSocket = function(id) {
      this.id = id;
      return this.openSocket(id);
    };

  };
  return new FileUploader();
}]);
