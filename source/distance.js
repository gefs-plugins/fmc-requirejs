"use strict";

define(['flight', 'utils', 'waypoints', 'exports'], function (flight, utils, waypoints, exports) {

	/**
	 * Computes the full route distance with waypoints
	 * Between start index (inclusive) and end index (exclusive)
	 *
	 * @param {Number} end The index of the end of the route to be calculated
	 * @returns {Number} The route distance
	 */
	exports.route = function (end) {

		var departure = flight.departure.coords();
		var arrival = flight.arrival.coords();
		var start = waypoints.nextWaypoint() || 0;
		var route = waypoints.route();
		var pos = geofs.aircraft.instance.llaLocation;

		// If there is no route
		if (route.length === 0) {
			// If departure and arrival airports are present
			if (flight.departure.airport() && flight.arrival.airport())
				return utils.getDistance(departure[0], departure[1], arrival[0], arrival[1]);
			else return 0;
		}

		// If there is not an activated waypoint
		if (waypoints.nextWaypoint() === null) {
			// If arrival airport is present and current coords are defined
			if (flight.arrival.airport() && pos[0])
				return utils.getDistance(pos[0], pos[1], arrival[0], arrival[1]);

			// If there are only current coords
			if (pos[0])
				return utils.getDistance(pos[0], pos[1], route[route.length - 1].lat(), route[route.length - 1].lon());

			// If neither is present
			return utils.getDistance(route[0].lat(), route[0].lon(), route[route.length - 1].lat(), route[route.length - 1].lon());
		}

		// If there is a waypoint activated
		else {
			var total = 0;

			// Loops from start to end to get total distance
			for (var i = start; i < end && i < route.length; i++) {
				total += route[i].distFromPrev();
			}

			// If waypoint is the last one in the list, compute distance to arrival airport also
			if (end === route.length) {
				if (flight.arrival.airport())
					total += utils.getDistance(route[end - 1].lat(), route[end - 1].lon(), arrival[0], arrival[1]);
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
		var a = utils.toRadians(angle);
		return r * Math.tan(a / 2) + 0.20;
	};
});
