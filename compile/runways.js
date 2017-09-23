'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const FILE_NAME = path.join(__dirname, `${require('./utils').ROOT_FOLDER}Runways.txt`);

let runways = {};

module.exports = new Promise(resolve => {
    fs.readFileAsync(FILE_NAME, 'utf-8').then(parseFile).then(writeFile).then(resolve);
});


// --
function parseFile (fileContent) {
    console.log('Parsing runways data');

    fileContent = fileContent.split('\r\n\r\n');

    for (let blocks = 0; blocks < fileContent.length - 1; blocks++) {
        let obj = {};

        fileContent[blocks] = fileContent[blocks].split('\r\n');

        for (let lines = 0; lines < fileContent[blocks].length; lines++) {
            fileContent[blocks][lines] = fileContent[blocks][lines].split(',');

            // Ignore the first line (descriptor)
            if (lines > 0) obj[String(fileContent[blocks][lines][1]).trim()] = [
                +fileContent[blocks][lines][8], // lon
                +fileContent[blocks][lines][9], // lat
                +fileContent[blocks][lines][10], // fieldElev
                +fileContent[blocks][lines][11], // glideslope
                +fileContent[blocks][lines][3], // length
                +fileContent[blocks][lines][4] // width
            ];
        }

        runways[fileContent[blocks][0][1]] = obj;
    }
}

function writeFile () {
    fs.writeFileSync('compiled-data/runways.json', JSON.stringify(runways));
}
