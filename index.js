/*jslint node:true, browser:true */

'use strict';

exports.FileReader = require('./lib/filereader').FileReader;
exports.FileWriter = require('./lib/filewriter').FileWriter;

exports.connect = require('./lib/driver/connect');
exports.programs = require('./lib/programs');

exports.keyOffset = 21;