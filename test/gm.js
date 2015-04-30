'use strict';

var assert = require('assert');
var gm = require('../index').gm;
var test = [19, 'church organ'];

describe('General MIDI API', function () {
    describe('programs and instruments', function () {
        it('should get the program of an instrument', function () {
            assert.deepEqual(gm.getProgram(test[1]), test[0]);
        });
        
        it('should get the instrument of a program', function () {
            assert.deepEqual(gm.getInstrument(test[0]), test[1]);
        });
        
        it('should be consistent', function () {
            assert.deepEqual(
                gm.getInstrument(gm.getProgram(gm.getInstrument(test[0]))),
                test[1]
            );
        });
    });
    
    describe('families', function () {
        it('should get the family of a program or instrument', function () {
            assert.deepEqual(gm.getFamily(test[1]), 'organ');
            assert.deepEqual(gm.getFamily(test[0]), 'organ');
        });
        
        it('should return false when no family match', function () {
            assert.deepEqual(gm.getFamily('not an instrument'), false);
        });
        
        it('should check for the family of a program', function () {
            assert.deepEqual(gm.getProgram(test[1], 'organ'), test[0]);
            assert.deepEqual(gm.getProgram(test[1], 'not an organ'), false);
            assert.deepEqual(gm.getInstrument(test[0], 'organ'), test[1]);
            assert.deepEqual(gm.getInstrument(test[0], 'not an organ'), false);
        });
    });
});
