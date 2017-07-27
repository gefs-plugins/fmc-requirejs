"use strict";

define(['exports'], function (exports) {

    var FILE_PATH = PAGE_PATH + 'fmc/compile/compiled-data/';

    exports.waypoints = [];
    exports.navaids = [];
    exports.SID = [];
    exports.STAR = [];
    exports.ATS = [];
    exports.runways = [];

    $.get(FILE_PATH + 'waypoints.json', function (waypoints) {
        exports.waypoints = waypoints;
    });

    $.get(FILE_PATH + 'navaids.json', function (navaids) {
        exports.navaids = navaids;
    });

    $.get(FILE_PATH + 'SID.json', function (SID) {
        exports.SID = SID;
    });

    $.get(FILE_PATH + 'STAR.json', function (STAR) {
        exports.STAR = STAR;
    });

    $.get(FILE_PATH + 'ATS.json', function (ATS) {
        exports.ATS = ATS;
    });

    $.get(FILE_PATH + 'runways.json', function (runways) {
        exports.runways = runways;
    });

});
