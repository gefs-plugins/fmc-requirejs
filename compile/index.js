'use strict';

const Promise = require('bluebird');

const fs = require('fs');
const path = require('path');

const waypoints = require('./waypoints');
const navaids = require('./navaids');
const airways = require('./ATS');
const runways = require('./runways');

fs.exists(path.join(__dirname, 'compiled-data'), exists => {
    if (!exists) fs.mkdir('compiled-data');
});
Promise.all([ waypoints, navaids, airways, runways ])
    .then(() => {
        console.log('Parsing SID data');
        new Promise(resolve => {
            const SID = require('./SID');
            Promise.all(SID.promises).then(SID.writeFile).then(resolve);
        });
    }).then(() => {
        console.log('Parsing STAR data');
        new Promise(resolve => {
            const STAR = require('./STAR');
            Promise.all(STAR.promises).then(STAR.writeFile);
        });
    }).then(() => console.log('\nDone!'));
