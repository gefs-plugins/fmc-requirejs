"use strict"; // TODO Properly implement

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all runway info for airport
     *
     * @param {String} airport
     * @returns {Array} The array of runway list
     */
    return function getRunway (airport) {
        var runways = data.runways[airport];
        var runwayArray = [];

        for (var rwy in runways) {
            runwayArray.push({
                runway: rwy,
                data: runways[rwy]
            });
        }

        return ko.observableArray(runwayArray);
    };

});
