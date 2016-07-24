"use strict";

define(['distance', 'flight', 'math', 'waypoints', 'ui/elements', 'exports'], function (distance, flight, math, waypoints, E, exports) {

	var container = E.container,
		input = E.input;

	/**
	 * @private
	 * Formats bearing: turns into heading 360
	 *
	 * @param {Number} brng The bearing to be converted
	 * @returns {Number} Bearing in terms of 360 degrees
	 */
	function formatBearing (brng) {
		if (brng <= 0) return Number(360 + brng);
		else return Number(brng);
	}

	var timer = null; // setInterval(updateProgress, 5000);

	/**
	 * Updates the plane's progress during flying, set on a timer
	 *
	 * @param {Object} waypoints FMC waypoints object
	 * @param {Number} nextWaypoint FMC waypoints.nextWaypoint
	 */
	function update () {
		var route = waypoints.route;
		var nextWaypoint = waypoints.nextWaypoint;
		var lat1 = gefs.aircraft.llaLocation[0] || 0;
		var lon1 = gefs.aircraft.llaLocation[1] || 0;
		var lat2 = flight.arrival[1] || 0;
		var lon2 = flight.arrival[2] || 0;
		var times = [[], [], [], [], []]; // flightete, flighteta, todete, todeta, nextete
		var nextdist = distance.route(waypoints, nextWaypoint);
		var flightdist;
		for (var i = 0, test = true; i < route.length; i++) {
			if (!route[i][1]) test = false;
		}
		if (test) flightdist = distance.route(waypoints, route.length + 1);
		else flightdist = math.getDistance(lat1, lon1, lat2, lon2);

		if (!gefs.aircraft.groundContact && flight.arrival) {
			times[0] = flight.getETE(flightdist, true);
			times[1] = flight.getETA(times[0][0], times[0][1]);
			times[4] = flight.getETE(nextdist, false);
			if ((flightdist - flight.tod) > 0) {
				times[2] = flight.getETE((flightdist - flight.tod), false);
				times[3] = flight.getETA(times[2][0], times[2][1]);
			}
		}

		print(flightdist, nextdist, times);
		printNextWaypointInfo(nextWaypoint, lat1, lon1);
	}

	/**
	 * Updates plane's phase of flying: climb, cruise, or descent
	 *
	 * @description Phase contains "climb," "cruise," and "descent"
	 * @param {Object} waypoints FMC waypoints object
	 * @TODO add a better logic, especially near the cruise phase
	 */
	function updatePhase () {
		var currentAlt = 100 * Math.round(gefs.aircraft.animationValue.altitude / 100);
		if (flight.phase === "climb" && currentAlt === Number(flight.cruise)) {
			$('#phaseBtn').click();
		} else if (flight.phase === "cruise") {
			var dist = distance.route(waypoints, waypoints.route.length + 1);
			if (currentAlt !== Number(flight.cruise)) {
				$('#phaseBtn').click();
			} else if (dist <= flight.tod) {
				$('#phaseBtn').click();
			}
		}
	}

	/**
	 * Prints plane's progress to the UI
	 *
	 * @param {Number} flightdist The total flight distance
	 * @param {Number} nextdist The distance to the next waypoint
	 * @param {Array} times An array of the time: [hours, minutes]
	 */
	function print (flightdist, nextdist, times) {
		for (var i = 0; i < times.length; i++) {
			times[i] = flight.formatTime(times[i]);
		}

		if (flightdist && !isNaN(flightdist)) { // If flightdist exists and is valid
			if (flightdist < 10) {
				flightdist = Math.round(flightdist * 10) / 10;
			} else flightdist = Math.round(flightdist);
			// If TOD is entered and TOD has not been passed
			if (flight.tod && flight.tod < flightdist) var toddist = flightdist - flight.tod;
			else var toddist = '--';
		} else {
			flightdist = '--';
			var toddist = '--';
		}

		if (nextdist && !isNaN(nextdist)) { // If nextdist exists and is valid
			if (nextdist < 10) {
				nextdist = (Math.round(10 * nextdist)) / 10;
			} else nextdist = Math.round(nextdist);
		} else nextdist = '--';

		$('#flightete').text('ETE: ' + times[0]);
		$('#flighteta').text('ETA: ' + times[1]);
		$('#todete').text('ETE: ' + times[2]);
		$('#todeta').text('ETA: ' + times[3]);
		$('#flightdist').text(flightdist + ' nm');
		$('#externaldist').text(flightdist + ' nm');
		$('#toddist').text(toddist + ' nm');
		$('#nextDist').text(nextdist + ' nm');
		$('#nextETE').text(times[4]);
	}

	/**
	 * Prints the distance and bearing of the next waypoint under current one
	 *
	 * @param {Object} waypoints FMC waypoints object
	 * @param {Number} n The index of the current waypoint
	 * @param [optional]{Number} lat The current latitude
	 * @param [optional]{Number} lon The current longitude
	 *
	 * TODO Implement arrival airport distance/bearing field
	 */
	function printNextWaypointInfo (n, lat, lon) {
		var containers = $(container.wptInfo);
		var departureAirport = $(input.dep).val().trim();
		var arrivalAirport = $(input.arr).val().trim();
		var route = waypoints.route;

		if (arguments.length !== 3) { // Function called by `change` in jQuery events or waypoints.shiftWaypoint (no current coords)
			// If this waypoint is not the last nor the first in the list
			if (n < route.length - 1 && n !== 0) {
				// Print in terms of the previous waypoint
				var dist = Math.round(math.getDistance(route[n-1][1], route[n-1][2], route[n][1], route[n][2]) * 10) / 10;
				var brng = Math.round(math.getBearing(route[n-1][1], route[n-1][2], route[n][1], route[n][2]) * 10) / 10;
				console.log('Prev --> current: ' + dist + ' NM / ' + formatBearing(brng) + '°');
				if (!!dist && !!brng) containers.eq(n).text(dist + ' NM / ' + formatBearing(brng) + '°');
				else containers.eq(n).text('');

				// Print in terms of the next waypoint
				dist = Math.round(math.getDistance(route[n][1], route[n][2], route[n+1][1], route[n+1][2]) * 10) / 10;
				brng = Math.round(math.getBearing(route[n][1], route[n][2], route[n+1][1], route[n+1][2]) * 10) / 10;
				console.log('Current --> next: ' + dist + ' NM / ' + formatBearing(brng) + '°');
				if (!!dist && !!brng) containers.eq(n+1).text(dist + ' NM / ' + formatBearing(brng) + '°');
				else containers.eq(n).text('');
			} else {
				if (n === 0) { // If the waypoint is the first in the list
					if (departureAirport) { // If departure airport is defined
						var coords;
						try {
							coords = autopilot_pp.require('icaoairports')[departureAirport];
						} catch (e) {
							coords = undefined;
						}

						if (coords) {
							var dist = Math.round(math.getDistance(coords[0], coords[1], route[n][1], route[n][2]) * 10) / 10;
							var brng = Math.round(math.getBearing(coords[0], coords[1], route[n][1], route[n][2]) * 10) / 10;
							console.log('Dep --> current ' + dist + ' NM / ' + formatBearing(brng) + '°');
							if (!!dist && !!brng) containers.eq(n).text(dist + ' NM / ' + formatBearing(brng) + '°');
							else containers.eq(n).text('');
						}
					} else { // If no departure airport is present
						containers.eq(n).text('Test: no departure airport');
					}
				} else { // If the waypoint is the last in the list
					// Prints previous --> current information regardless
					var dist = Math.round(math.getDistance(route[n-1][1], route[n-1][2], route[n][1], route[n][2]) * 10) / 10;
					var brng = Math.round(math.getBearing(route[n-1][1], route[n-1][2], route[n][1], route[n][2]) * 10) / 10;
					console.log('Last waypoint! Prev --> current: ' + dist + ' NM / ' + formatBearing(brng) + '°');
					if (!!dist && !!brng) containers.eq(n).text(dist + ' NM / ' + formatBearing(brng) + '°');
					else containers.eq(n).text('');

					if (arrivalAirport) { // If arrival airport is defined
						// TODO
					} else { // If no arrival airport is present
						// containers.eq(n).text('Test: no arrival airport');
						// TODO
					}
				}
			}
		} else { // When function is called by progress.update (with current coords)
			if (n) { // If there is a next waypoint as defined in waypoints.nextWaypoint
				var dist = Math.round(math.getDistance(lat, lon, route[n][1], route[n][2]) * 10) / 10;
				var brng = Math.round(math.getBearing(lat, lon, route[n][1], route[n][2]) * 10) / 10;
				console.log('Current pos --> current waypoint ' + dist + ' NM / ' + formatBearing(brng) + '°');
				if (!!dist && !!brng) containers.eq(n).text(dist + ' NM / ' + formatBearing(brng) + '°');
				else containers.eq(n).text('');

				// Removes next waypoint info from all previous waypoints
				for (var i = 0; i < n; i++) {
					containers.eq(i).text('');
				}
			} else { // If there is not a next waypoint
				for (var i = 0; i < route.length; i++) printNextWaypointInfo(i);
			}
		}
	}

	// Variables
	exports.timer = timer;

	// Functions
	exports.update = update;
	exports.updatePhase = updatePhase;
	exports.print = print;
	exports.printNextWaypointInfo = printNextWaypointInfo;

});
