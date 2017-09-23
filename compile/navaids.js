'use strict';

const Promise = require('bluebird');

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const PATH = `${require('./utils').ROOT_FOLDER}Navaids.csv`;
const FILE_NAME = path.join(__dirname, PATH);

module.exports = new Promise(resolve => {
    console.log('Parsing navaids data');

    let navaids = {};
    fs.createReadStream(FILE_NAME)
        .pipe(csv())
        .on('data', vor => {
            let arr = [ +vor.lat, +vor.lon, vor.name ];

            if (navaids[vor.navaid] && Array.isArray(navaids[vor.navaid]))
                navaids[vor.navaid].push(arr);
            else navaids[vor.navaid] = [ arr ];
        }).on('end', () => {
            const stringified = JSON.stringify(navaids);

            fs.writeFileSync('compiled-data/navaids.json', stringified);
            resolve();
        });
});
