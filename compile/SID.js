'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var PATH = path.join(__dirname, require('./constants').ROOT_FOLDER + 'SID/');

var fileList = readDir(PATH);
var SID = {};

fileList.forEach(function (file) {
    var airportName = file.substring(0, file.indexOf('.txt'));
    SID[airportName] = [];

    fs.readFileAsync(PATH + file, 'utf-8')
        .then(function (data) { parseFile(data, airportName); })
        .then(writeFile);
})


// --
function readDir (dir) {
    var list = [];
    fs.readdirSync(dir).forEach(function (file) {
        if (/\.txt/.test(file)) list.push(file);
    });

    return list;
}

function parseFile (fileContent, airportName) {
    // Splits each SID based on SID name and departure runway (SID blocks)
    fileContent = fileContent.split('\r\n\r\n');

    for (var blocks = 0; blocks < fileContent.length; blocks++) {
        // Splits each SID block by line (SID line)
        fileContent[blocks] = fileContent[blocks].split('\r\n');

        var obj = {
            name: '',
            runway: '',
            transition: '',
            waypoints: []
        };

        for (var lines = 0; lines < fileContent[blocks].length; lines++) {
            // Splits each SID line by element
            fileContent[blocks][lines] = fileContent[blocks][lines].split('|');

            if (fileContent[blocks][lines][1] !== ' ' && lines !== 0) {

                obj.waypoints.push(fileContent[blocks][lines][1].trim());

                // SID[airportName][SID[airportName].length - 1].waypoints.push({
                //     fix: fileContent[blocks][lines][1],
                //     altRes: 0 ? undefined : fileContent[blocks][lines][13],
                //     spdRes: 0 ? undefined : fileContent[blocks][lines][11]
                // });
            }
        }

        var descriptor = fileContent[blocks][0];
        obj.name = String(descriptor[1]).trim();
        obj.runway = String(descriptor[2]).trim();
        obj.transition = String(descriptor[3]).trim();

        if (obj.name && obj.runway && obj.transition && obj.waypoints)
            SID[airportName].push(obj);
    }

}

function writeFile () {
    fs.writeFileSync('compiled-data/SID.json', JSON.stringify(SID));
}
