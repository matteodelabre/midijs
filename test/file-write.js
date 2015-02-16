'use strict';

var assert = require('assert');

var File = require('../lib/file').File;

describe('File as a writer', function () {
    var file;
    
    it('should create a new file', function () {
        var header, tracks;
        
        file = new File();
        header = file.getHeader();
        tracks = file.getTracks();
        
        assert.strictEqual(header.getFileType(), 1);
        assert.strictEqual(header._trackCount, 0);
        assert.strictEqual(header.getTicksPerBeat(), 120);
        
        assert.ok(Array.isArray(tracks));
        assert.strictEqual(tracks.length, header._trackCount);
    });
});
