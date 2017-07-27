"use strict"; // TODO Properly implement

define(['data', 'log'], function (data, log) {

    function getAirway (startFix, airway, endFix) {
        if (!startFix || !endFix) log.warn('There must be one waypoint before and after the airway.');

        var airwayList = data.ATS[airway]; // jshint unused: false

        var validList;
    }

    return function (startFix, airway, endFix) {
        return getAirway(startFix, airway, endFix);
    };

});
