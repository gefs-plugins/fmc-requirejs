"use strict";

define(['flight', 'math', 'waypoints', 'exports'], function (flight, math, waypoints, exports) {

	/**
	 * Computes the full route distance with waypoints until index
	 *
	 * @param {Object} waypoints FMC waypoints object
	 * @param {Number} end The index of the end of the route to be calculated
	 * @returns {Number} The route distance
	 */
	function route (end) {
		var loc = gefs.aircraft.llaLocation || [0, 0, 0];
		var start = waypoints.nextWaypoint || 0;
		var route = waypoints.route;
		var arrival = flight.arrival;
		var total;
		if (route.length === 0 || !waypoints.nextWaypoint) {
			total = math.getDistance(loc[0], loc[1], arrival[1], arrival[2]);
		} else {
			total = math.getDistance(loc[0], loc[1], route[start - 1][1], route[start - 1][2]);
			for (var i = start; i < end && i < route.length; i++) {
				total += math.getDistance(route[i - 1][1], route[i - 1][2], route[i][1], route[i][2]);
			}
			if (end > route.length) {
				total += math.getDistance(route[route.length - 1][1], route[route.length - 1][2], arrival[1], arrival[2]);
			}
		}
		return total;
	}

	/**
	 * Computes the distance needed to climb or descend to a certain altitude from current altitude
	 *
	 * @param {Number} deltaAlt The altitude difference
	 * @returns {Number} The distance
	 */
	function target (deltaAlt) {
		var targetDist;
		if (deltaAlt < 0) {
			targetDist = deltaAlt / -1000 * 3.4;
		} else {
			targetDist = deltaAlt / 1000 * 2.5;
		}
		return targetDist;
	}

	/**
	 * Computes the turning distance to next waypoint for an aircraft to be on course
	 *
	 * @param {Number} angle Angle of turning
	 * @returns {Number} The turning distance
	 */
	function turn (angle) {
		var v = gefs.aircraft.animationValue.kcas;
		var r = 0.107917 * Math.pow(Math.E, 0.0128693 * v);
		var a = math.toRadians(angle);
		return r * Math.tan(a / 2) + 0.20;
	}

	exports.route = route;
	exports.target = target;
	exports.turn = turn;
});
