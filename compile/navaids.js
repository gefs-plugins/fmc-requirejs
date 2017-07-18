'use strict';

var fs = require('fs');
var csv = require('csv-parser');
var path = require('path');

var PATH = require('./constants').ROOT_FOLDER + 'Navaids.csv';
var FILE_NAME = path.join(__dirname, PATH);

var navaids = {};

fs.createReadStream(FILE_NAME)
    .pipe(csv())
    .on('data', function (vor) {
        var arr = [ +vor.lat, +vor.lon, vor.name ];

        if (navaids[vor.navaid] && Array.isArray(navaids[vor.navaid]))
            navaids[vor.navaid].push(arr);
        else navaids[vor.navaid] = [arr];
    }).on('end', function () {
        var stringified = JSON.stringify(navaids);
        // stringified = stringified.replace(/\],"/g, ']\n, "')
        //     .replace(/,(?=[-\d])/g, ', ')
        //     .replace(/:\[/g, ': [')
        //     .replace(/\],\[/g, '], [');

        fs.writeFileSync('compiled-data/navaids.json', stringified);
    });
