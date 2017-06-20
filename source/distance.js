"use strict";

define(['flight', 'math', 'waypoints', 'exports'], function (flight, math, waypoints, exports) {

	/**
	 * Computes the full route distance with waypoints
	 * Between start (inclusive) and end index (exclusive)
	 *
	 * @param {Number} end The index of the end of the route to be calculated
	 * @returns {Number} The route distance
	 */
	exports.route = function (end) {

		var arrival = flight.arrival;
		var start = waypoints.nextWaypoint || 0;
		var route = waypoints.route;
		var pos = geofs.aircraft.instance.llaLocation;

		// If there is no route
		if (route.length === 0) return 0;

		// If there is not an activated waypoint
		else if (!waypoints.nextWaypoint) {
			// If arrival airport is present and current coords are defined
			if (arrival[0] && pos)
				return math.getDistance(pos[0], pos[1], arrival[1], arrival[2]);

			// If there are only current coords
			else if (pos)
				return math.getDistance(pos[0], pos[1], route[route.length - 1][1], route[route.length - 1][2]);

			// If neither is present
			else return math.getDistance(route[0][1], route[0][2], route[route.length - 1][1], route[route.length - 1][2]);
		}

		// If there is a waypoint activated
		else {
			var total = 0;

			// Loops from start to end to get total distance
			for (var i = start + 1; i < end && i < route.length; i++) {
				total += math.getDistance(route[i-1][1], route[i-1][2], route[i][1], route[i][2]);
			}

			// If waypoint is the last one in the list, compute distance to arrival airport also
			if (end === route.length) {
				if (arrival[0])
					total += math.getDistance(route[end - 1][1], route[end - 1][2], arrival[1], arrival[2]);
			}

			return total;
		}
	};

	/**
	 * Computes the distance needed to climb or descend to a certain altitude from current altitude
	 *
	 * @param {Number} deltaAlt The altitude difference
	 * @returns {Number} The distance
	 */
	exports.target = function (deltaAlt) {
		var targetDist;
		if (deltaAlt < 0) {
			targetDist = deltaAlt / -1000 * 3.4;
		} else {
			targetDist = deltaAlt / 1000 * 2.5;
		}
		return targetDist;
	};

	/**
	 * Computes the turning distance to next waypoint for an aircraft to be on course
	 *
	 * @param {Number} angle Angle of turning
	 * @returns {Number} The turning distance
	 */
	exports.turn = function (angle) {
		var v = geofs.aircraft.instance.animationValue.kcas;
		var r = 0.107917 * Math.pow(Math.E, 0.0128693 * v);
		var a = math.toRadians(angle);
		return r * Math.tan(a / 2) + 0.20;
	};
});
