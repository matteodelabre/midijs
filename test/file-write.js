'use strict';

var assert = require('assert');

var File = require('../lib/file').File;

describe('File as a writer', function () {
    var file;
    
    it('should create a new file', function () {
        file = new File();
        
        assert.strictEqual(file.header.fileType, 1);
        assert.strictEqual(file.header.trackCount, 0);
        assert.strictEqual(file.header.ticksPerBeat, 120);
        
        assert.ok(Array.isArray(file.tracks));
        assert.strictEqual(file.tracks.length, file.header.trackCount);
    });
});
