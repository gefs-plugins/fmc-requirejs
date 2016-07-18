"use strict";

define(['distance', 'lib', 'math', 'waypoints'], function (distance, lib, math, waypoints) {
	return {
		timer: null, // setInterval(updateProgress, 5000);

		/**
		 * Updates the plane's progress during flying, set on a timer
		 */
		update: function() {
			var lat1 = gefs.aircraft.llaLocation[0] || 0;
			var lon1 = gefs.aircraft.llaLocation[1] || 0;
			var lat2 = lib.arrival[1] || 0;
			var lon2 = lib.arrival[2] || 0;
			var times = [[], [], [], [], []]; // flightete, flighteta, todete, todeta, nextete
			var nextdist = distance.route(waypoints.nextWaypoint);
			var flightdist;
			for (var i = 0, test = true; i < waypoints.route.length; i++) {
				if (!waypoints.route[i][1]) test = false;
			}
			if (test) flightdist = distance.route(waypoints.route.length + 1);
			else flightdist = math.getDistance(lat1, lon1, lat2, lon2);

			if (!gefs.aircraft.groundContact && lib.arrival) {
				times[0] = lib.getETE(flightdist, true);
				times[1] = lib.getETA(times[0][0], times[0][1]);
				times[4] = lib.getETE(nextdist, false);
				if ((flightdist - lib.tod) > 0) {
					times[2] = lib.getETE((flightdist - lib.tod), false);
					times[3] = lib.getETA(times[2][0], times[2][1]);
				}
			}

			lib.print(flightdist, nextdist, times);
			lib.printNextWaypointInfo(waypoints.nextWaypoint, lat1, lon1);
		}
	};
});
