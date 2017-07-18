"use strict";

define(['data', 'math', 'waypoints'], function (data, math, waypoints) {

    // Autopilot++ Dependencies
    var icao = autopilot_pp.require('json!data/icaoairports.json');

    /**
     * Finds closest point to the last waypoint in waypoints.route
     * or current coordinates
     *
     * @param {Array} list The list of coordinates
     */
    function closestPoint (list) {
        var closestDist = Infinity;

        return list.reduce(function (closestPoint, point) {

            // Sets current coords to the last waypoint in the list if applicable
            // Else, current coords set to current position
            // FIXME add better logic
            var lat = waypoints.route[waypoints.route.length - 1][0] ||
                geofs.aircraft.instance.llaLocation[0];
            var lon = waypoints.route[waypoints.route.length - 1][1] ||
                geofs.aircraft.instance.llaLocation[1];

            var relativeDist = math.getDistance(point[0], point[1], lat, lon);

            // If this point is closer than the previous point, return this point
            if (relativeDist < closestDist) {
                closestDist = relativeDist;
                return point;
            }

            // If this point is further than the closest point, return closestPoint
            return closestPoint;

        });
    }

    /**
     * Gets coordinates for ICAO Airports, Waypoints, or Navaids
     *
     * @param {String} fix The name of the fix
     * @returns {Array} The coordinates array
     */
    return function (fix) {
        var coords = icao[fix];
        if (coords) return coords;

        var list = data.waypoints[fix];
        if (list) return closestPoint(list);

        list = data.navaids[fix];
        if (list) return closestPoint(list);

        return undefined;
    };
});
