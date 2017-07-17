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
        var obj = {
            name: vor.name,
            coords: [ +vor.lat, +vor.lon ]
        };

        if (navaids[vor.navaid] && Array.isArray(navaids[vor.navaid]))
            navaids[vor.navaid].push(obj);
        else navaids[vor.navaid] = [obj];
    }).on('end', function () {
        var stringified = JSON.stringify(navaids);
        stringified = stringified.replace(/\],"/g, ']\n, "')
            .replace(/,(?=[-\d])/g, ', ')
            .replace(/:\[/g, ': [')
            .replace(/\],\[/g, '], [');

        fs.writeFileSync('compiled-data/navaids.json', stringified);
    });
