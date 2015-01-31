/*jslint node:true, browser:true */

'use strict';

exports.Reader = require('./lib/parser/reader').Reader;
exports.Writer = require('./lib/parser/writer').Writer;

exports.connect = require('./lib/driver/connect');
exports.programs = require('./lib/programs');

exports.keyOffset = 21;