'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const waypoints = require('./waypoints');
const navaids = require('./navaids');
const airways = require('./ATS');
const runways = require('./runways');

fs.existsAsync(path.join(__dirname, 'compiled-data')).then(exists => {
    if (!exists) fs.mkdir('compiled-data');

    Promise.all([ waypoints, navaids, airways, runways ])
        .then(() => console.log('\nDone!'));
}).catch(console.error);
