'use strict';

var fs = require('fs');
var csv = require('csv-parser');
var path = require('path');

var PATH = require('./constants').ROOT_FOLDER + 'Waypoints.csv';
var FILE_NAME = path.join(__dirname, PATH);

var waypoints = {};

fs.createReadStream(FILE_NAME)
    .pipe(csv())
    .on('data', function (fix) {
        // If the waypoint has a duplicate name, only push coords
        if (waypoints[fix.waypoint] && Array.isArray(waypoints[fix.waypoint]))
            waypoints[fix.waypoint].push([ +fix.lat, +fix.lon ]);

        // Else, create waypoint and coords
        else waypoints[fix.waypoint] = [[ +fix.lat, +fix.lon ]];
    }).on('end', function () {
        var stringified = JSON.stringify(waypoints);
        stringified = stringified.replace(/\],"/g, ']\n, "')
            .replace(/,(?=[-\d])/g, ', ')
            .replace(/:\[/g, ': [')
            .replace(/\],\[/g, '], [');

        fs.writeFileSync('compiled-data/waypoints.json', stringified);
    });
