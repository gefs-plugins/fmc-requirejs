"use strict";

define(['data', 'utils', 'waypoints'], function (data, utils, waypoints) {

    // Autopilot++ Dependencies
    var icao = autopilot_pp.require('json!data/icaoairports.json');

    /**
     * Finds closest point to the last waypoint in waypoints.route
     * or current coordinates
     *
     * @param {Array} list The list of coordinates
     * @param {Number} index Index of the route
     */
    function closestPoint (list, index) {
        var closestDist = Infinity, closestIndex = 0;

        for (var i = 0; i < list.length; i++) {

            // Sets current coords to the previous waypoint in the list if applicable
            // Else, current coords set to current position
            var curLat = geofs.aircraft.instance.llaLocation[0];
            var curLon = geofs.aircraft.instance.llaLocation[1];
            var lat = index === 0 ? curLat : waypoints.route()[index-1].lat();
            var lon = index === 0 ? curLon : waypoints.route()[index-1].lon();

            var relativeDist = utils.getDistance(list[i][0], list[i][1], lat, lon);

            if (relativeDist < closestDist) {
                closestDist = relativeDist;
                closestIndex = i;
            }

        }

        return list[closestIndex];
    }

    /**
     * Gets coordinates for ICAO Airports, Waypoints, or Navaids
     *
     * @param {String} fix The name of the fix
     * @param {Number} index Index of the route
     * @returns {Array} The coordinates array
     */
    return function (fix, index) {
        var coords = icao[fix];
        if (coords) return coords;

        var list = data.waypoints[fix];
        if (list) return closestPoint(list, index);

        list = data.navaids[fix];
        if (list) return closestPoint(list, index);

        return undefined;
    };
});
