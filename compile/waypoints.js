'use strict';

const Promise = require('bluebird');

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const PATH = `${require('./utils').ROOT_FOLDER}Waypoints.csv`;
const FILE_NAME = path.join(__dirname, PATH);

module.exports = new Promise(resolve => {
    console.log('Parsing waypoints data');

    let waypoints = {};
    fs.createReadStream(FILE_NAME)
        .pipe(csv())
        .on('data', fix => {
            // If the waypoint has a duplicate name, only push coords
            if (waypoints[fix.waypoint] && Array.isArray(waypoints[fix.waypoint]))
                waypoints[fix.waypoint].push([ +fix.lat, +fix.lon ]);

            // Else, create waypoint and coords
            else waypoints[fix.waypoint] = [[ +fix.lat, +fix.lon ]];
        }).on('end', () => {
            const stringified = JSON.stringify(waypoints);

            fs.writeFileSync('compiled-data/waypoints.json', stringified);
            resolve();
        });
});
