'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const FILE_NAME = path.join(__dirname, `${require('./utils').ROOT_FOLDER}ATS.txt`);

let ATS = {};

module.exports = new Promise(resolve => {
    fs.readFileAsync(FILE_NAME, 'utf-8').then(parseFile).then(writeFile).then(resolve);
});



// --
function parseFile (fileContent) {
    console.log('Parsing airways data');

    fileContent = fileContent.split('\r\n\r\n');

    for (let blocks = 0; blocks < fileContent.length - 1; blocks++) {
        let fixesList = [];
        fileContent[blocks] = fileContent[blocks].split('\r\n');

        for (let lines = 0; lines < fileContent[blocks].length; lines++) {
            fileContent[blocks][lines] = fileContent[blocks][lines].split(',');

            // Ignores the first line (descriptor) when adding fixes
            if (lines > 0) fixesList.push(fileContent[blocks][lines][1].trim());

            // Adds the ending fix
            if (lines === fileContent[blocks].length - 1)
                fixesList.push(fileContent[blocks][lines][4].trim());
        }

        // If this airway already exists, push duplicate fixes
        if (Array.isArray(ATS[fileContent[blocks][0][1]]))
            ATS[fileContent[blocks][0][1]].push(fixesList);
        else ATS[fileContent[blocks][0][1]] = [fixesList];
    }
}

function writeFile () {
    fs.writeFileSync('compiled-data/ATS.json', JSON.stringify(ATS));
}
