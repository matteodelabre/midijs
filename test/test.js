/*jslint node:true, browser:true, nomen:true */

'use strict';

var fs = require('fs');
var util = require('util');

var File = require('../lib/file');
var url = __dirname + '/files/Hoagy Carmichael - Heart and Soul.mid';

fs.readFile(url, function (err, data) {
    if (err) {
        throw err;
    }

    var pattern = new File(data);
    
    console.log(util.inspect(pattern.header, false, null));
    console.log(util.inspect(pattern.tracks, false, null));
});