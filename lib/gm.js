/**
 * @module midijs/lib/gm
 */

'use strict';

var gm = require('./gm.json');

/**
 * Check if a program is in a family of instruments
 *
 * @private
 * @param {number} program - Program to test
 * @param {string} family - Family name
 * @return {boolean} Whether the program belongs to the family
 */
function checkFamily(program, family) {
    var familyIndex = gm.families.indexOf(family.toLowerCase());
    
    if (familyIndex === -1 || program < (familyIndex * 8) ||
            program >= ((familyIndex + 1) * 8)) {
        return false;
    }
    
    return true;
}

/**
 * Fetch the program of an instrument, only if it belongs
 * to the given family, if one is given
 *
 * @param {string} instrument - Instrument name
 * @param {?string} family - Family name
 * @return {number|false} The matching program or false if it doesn't
 *                        exist or doesn't belong to the given family
 */
exports.getProgram = function (instrument, family) {
    var program = gm.instruments.indexOf(instrument.toLowerCase());
    
    if ((family !== undefined && !checkFamily(program, family)) ||
            program === -1) {
        return false;
    }
    
    return program;
};

/**
 * Fetch the instrument of a program, only if it belongs
 * to the given family, if one is given
 *
 * @param {number} program - Program number
 * @param {?string} family - Family name
 * @return {string|false} The matching instrument or false if it doesn't
 *                        exist or doesn't belong to the given family
 */
exports.getInstrument = function (program, family) {
    var instrument = gm.instruments[program];
    
    if ((family !== undefined && !checkFamily(program, family)) ||
            instrument === undefined) {
        return false;
    }
    
    return instrument;
};

/**
 * Fetch the family of an instrument/program
 *
 * @param {number|string} instrumentOrProgram - Instrument/program that
 *                                              belongs to the family
 *                                              to search for
 * @return {string|false} The matching family or false if it doesn't
 *                        exist
 */
exports.getFamily = function (instrumentOrProgram) {
    var program, familyIndex, family;
    
    if (typeof instrumentOrProgram === 'string') {
        program = gm.instruments.indexOf(instrumentOrProgram.toLowerCase());
    } else {
        program = instrumentOrProgram;
    }
    
    familyIndex = Math.floor(program / 8);
    family = gm.families[familyIndex];
    
    if (family === undefined) {
        return false;
    }
    
    return family;
};
