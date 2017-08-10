'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

require('graceful-fs').gracefulify(fs);

const PATH = path.join(__dirname, require('./utils').ROOT_FOLDER + 'proc/');
const RWY_REGEXP = /^\d\d[LCR]?$/;

const waypoints = require('./compiled-data/waypoints.json');
const navaids = require('./compiled-data/navaids.json');
const fileList = require('./utils').readDir(PATH);

let promises = [], approaches = {};

fileList.forEach(file => {
    promises.push(new Promise(resolve => {
        const airportName = file.substring(0, file.indexOf('.txt'));

        fs.readFileAsync(PATH + file, 'utf-8')
            .then(data => parseFile(data, airportName))
            .then(resolve);
    }));
});

module.exports = new Promise(resolve => {
    console.log('Parsing approach data');
    Promise.all(promises).then(writeFile);
});

// Normalize an approach name
function toNormalized (name) {
    const convertMap = {
        I: 'ILS',
        R: 'RNAV',
        D: 'VOR'
    }; // FIXME there are also 'S' and 'N', probably more...

    let normalized = convertMap[name.substring(0, 1)] || name.substring(0, 1);
    return normalized + name.substring(1, name.length);
}

// Callback functions
function parseFile (fileContent, airportName) { // FIXME Various airports outside US
    // Splits each block (may contain SID, STAR, Final...)
    let temp = fileContent.split('\r\n\r\n');
    temp.shift();
    fileContent = []; // Empties fileContent for approach filters

    // Indeces of FINALs with at least one preceeding APPTR
    let finalWithAPPTR = {};

    // Filters and combines APPTR and FINAL blocks and pushes to fileContent
    for (let i = 0; i < temp.length; i++) {
        if (temp[i].indexOf('APPTR') === 0) {
            let apptrBlock = temp[i];

            // Loops to find FINAL that pairs with current APPTR
            // FIXME logic check: does FINAL follow APPTR?
            let offset;
            for (offset = i + 1; offset < temp.length; offset++)
                if (temp[offset].indexOf('FINAL') === 0) break;

            let finalBlock = temp[offset];

            finalWithAPPTR[offset] = true;

            // FINAL should be combined with APPTR, but without the
            // first line (descriptor) and second line (transition waypoint)
            finalBlock = finalBlock.split('\r\n'); // Splits into lines
            finalBlock.splice(0, 2); // Removes first two lines

            // Joins the two blocks with a new line
            const processedBlock = [apptrBlock, finalBlock.join('\r\n')].join('\r\n');

            // Gives fileContent the processed block
            fileContent.push(processedBlock);
        } else if (temp[i].indexOf('FINAL') === 0) {
            if (!finalWithAPPTR[i]) fileContent.push(temp[i]);
        }
    }

    if (fileContent.length === 0) return;

    approaches[airportName] = [];

    for (let blocks = 0; blocks < fileContent.length; blocks++) {
        // Splits each approach block by line
        fileContent[blocks] = fileContent[blocks].split('\r\n');

        let obj = {
            name: undefined,
            runway: undefined,
            transition: undefined,
            waypoints: []
        };

        let isEndOfApproach = false;

        for (let lines = 0; lines < fileContent[blocks].length; lines++) {
            // Splits each approach line by element
            fileContent[blocks][lines] = fileContent[blocks][lines].split(',');
            const potentialWaypoint = fileContent[blocks][lines][1];

            if (lines > 0) {
                // If end of approach (ignore failed approach waypoints)
                if (!isNaN(+potentialWaypoint)) {
                    isEndOfApproach = true;
                    break;
                }

                // If end is a runway
                if (potentialWaypoint.indexOf('RW') === 0) {
                    isEndOfApproach = true;
                    obj.waypoints.push(fileContent[blocks][lines][1].trim());
                    break;
                }

                // If other situations (middle of approach)
                if (waypoints[potentialWaypoint] || navaids[potentialWaypoint])
                    obj.waypoints.push(fileContent[blocks][lines][1].trim());

            }
            if (isEndOfApproach) break;
        }

        const descriptor = fileContent[blocks][0];
        const name = toNormalized(descriptor[1]).trim();
        const runway = String(descriptor[2]).trim();
        const transition = String(descriptor[3]).trim();

        if (name) obj.name = name;
        if (runway) obj.runway = runway;
        if (descriptor[0] === 'APPTR' && transition) obj.transition = transition;

        approaches[airportName].push(obj);
    }

}

function writeFile () {
    fs.writeFileSync('compiled-data/approaches.json', JSON.stringify(approaches));
}
