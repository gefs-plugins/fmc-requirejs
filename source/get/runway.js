"use strict";

define(['data', './SID'], function (data, getSID) {

    /**
     * Get all runway info for airport
     *
     * @param {String} airport Departure or Arrival airport
     * @param {String} selected Selected SID or STAR name
     * @param {Boolean} isDeparture Is the aircraft in departure
     * @returns {Array} The array of runway list
     */
    return function (airport, selected, isDeparture) {
        // If there is no departure or arrival airport
        if (!airport) return [];

        var runways = data.runways[airport];
        var runwayArray = [];

        // If plane is in departure
        if (isDeparture) {
            // If there is already a selected SID, extracts a list of available runways
            if (selected) {
                getSID(airport, undefined, selected)[0].availableRunways.forEach(function (rwy) {
                    runwayArray.push({
                        runway: rwy
                    });
                });
            }

            // If there is no selected SID
            else {
                for (var rwy in runways) {
                    runwayArray.push({
                        runway: rwy
                    });
                }
            }
        }

        // If plane is in arrival
        else {} // TODO

        // Returns the list of runway
        return runwayArray;
    };

});
