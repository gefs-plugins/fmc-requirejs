'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var FILE_NAME = path.join(__dirname, require('./constants').ROOT_FOLDER + 'Runways.txt');

var runways = {};

fs.readFileAsync(FILE_NAME, 'utf-8').then(parseFile).then(writeFile);


// --
function parseFile (fileContent) {
    fileContent = fileContent.split('\r\n\r\n');

    for (var blocks = 0; blocks < fileContent.length - 1; blocks++) {
        var obj = {};

        fileContent[blocks] = fileContent[blocks].split('\r\n');

        for (var lines = 0; lines < fileContent[blocks].length; lines++) {
            fileContent[blocks][lines] = fileContent[blocks][lines].split(',');

            // Ignore the first line (descriptor)
            if (lines > 0) obj[String(fileContent[blocks][lines][1]).trim()] = [
                +fileContent[blocks][lines][8], // lon
                +fileContent[blocks][lines][9], // lat
                +fileContent[blocks][lines][10] // fieldElev
            ];
        }

        runways[fileContent[blocks][0][1]] = obj;
    }
}

function writeFile () {
    fs.writeFileSync('compiled-data/runways.json', JSON.stringify(runways));
}
