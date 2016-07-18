"use strict";

define(['distance', 'math', 'nav/progress', 'waypoints', 'text!vnav-profile.json'], function (distance, math, progress, waypoints, vnavProfile) {

	var tod;
	var VNAV = false;
	var arrival = [];
	var cruise;
	var phase = "climb";
	var todCalc = false;
	var fieldElev = 0;

	/**
	 * Updates plane's phase of flying: climb, cruise, or descent
	 *
	 * @description Phase contains "climb," "cruise," and "descent"
	 * @param <restricted>[optional]{String} p Updates the phase to "p"
	 * @TODO add a better logic, especially near the cruise phase
	 */
	function updatePhase () {
		var currentAlt = 100 * Math.round(gefs.aircraft.animationValue.altitude / 100);
		if (phase === "climb" && currentAlt === Number(cruise)) {
			$('#phaseBtn').click();
		} else if (phase === "cruise") {
			var dist = distance.route(waypoints.route.length + 1);
			if (currentAlt !== Number(cruise)) {
				$('#phaseBtn').click();
			} else if (dist <= tod) {
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
			times[i] = formatTime(times[i]);
		}

		if (flightdist && !isNaN(flightdist)) { // If flightdist exists and is valid
			if (flightdist < 10) {
				flightdist = Math.round(flightdist * 10) / 10;
			} else flightdist = Math.round(flightdist);
			// If TOD is entered and TOD has not been passed
			if (tod && tod < flightdist) var toddist = flightdist - tod;
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
	 * @param {Number} n The index of the current waypoint
	 * @param [optional]{Number} lat The current latitude
	 * @param [optional]{Number} lon The current longitude
	 *
	 * TODO Implement arrival airport distance/bearing field
	 */
	function printNextWaypointInfo (n, lat, lon) {
		var containers = $('.fmc-wpt-list-container .fmc-wpt-info');
		var arrivalAirport = $('.fmc-dep-arr-table-container input.arr').val().trim();
		var departureAirport = $('.fmc-dep-arr-table-container input.dep').val().trim();
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

	/**
	 * Gets each plane's flight parameters, for VNAV
	 *
	 * @returns {Array} vertical speed and speed
	 */
	function getFlightParameters () {
		var spd, vs;
		// var gndElev = gefs.groundElevation * metersToFeet;
		var a = gefs.aircraft.animationValue.altitude;
		var isMach = $('#Qantas94Heavy-ap-spd span:last-child').text().trim() === 'M.';
		var switchMode = function() {
			$('#Qantas94Heavy-ap-spd span:last-child').click();
		};

		// CLIMB
		if (phase == "climb") {
			if (a < 30000) {
				if (isMach) switchMode();
			} else if (a >= 30000) {
				if (!isMach) switchMode();
			}

			var profile = getVNAVProfile().climb;
			var index;
			for (var i=0; i<profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}
			spd = profile[index][2];
			vs = profile[index][3];
		}

		// DESCENT
		else if (phase == "descent") {
			if (a > 30000) {
				if (!isMach) switchMode();
			} else {
				if (isMach) switchMode();
			}

			var profile = getVNAVProfile().descent;
			var index;
			for (var i=0; i<profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}
			spd = profile[index][2];
			vs = profile[index][3];
		}
		return [spd, vs];
	}

	/**
	 * Activates a waypoint or deactivates if the waypoint is already activated
	 *
	 * @param {Number} n The index to be activated or deactivated
	 * FIXME Potential index confusion
	 * Should: start with 0; Instead: started with 1
	 */
	function activateLeg (n) {
		/**
		 * Toggles activated buttons
		 *
		 * @param {Boolean} toggleOn Whether the action is to toggle on
		 */
		var toggle = function (toggleOn) {
			if (toggleOn) {
				$('.fmc-wpt-list-container button[action="activate-wpt"]')
					.eq(n).removeClass('mdl-button--colored')
					.addClass('mdl-button--accent')
					.children().text('check_circle');
			} else {
				$('.fmc-wpt-list-container button.mdl-button--accent[action="activate-wpt"]')
					.removeClass('mdl-button--accent')
					.addClass('mdl-button--colored')
					.children().text('check');
			}
		};

		if (waypoints.nextWaypoint != n) {
			if (n < waypoints.route.length) {
				waypoints.nextWaypoint = n;
				var wpt = waypoints.route[waypoints.nextWaypoint];
				// TODO When AP++ implements fix for duplicate waypoints, improve this algorithm
				// FIXME also...
				if (wpt[4]) {
					$('#Qantas94Heavy-ap-icao > input').val(wpt[0]).change();
				} else {
					$('#Qantas94Heavy-ap-gc-lat > input').val(wpt[1]).change();
					$('#Qantas94Heavy-ap-gc-lon > input').val(wpt[2]).change();
				}
				toggle(false);
				toggle(true);

				progress.update(); // Updates progress: prints general progress info and next waypoint info
				console.log('Waypoint # ' + n + 1 + ' activated | index: ' + n);
			} else {
				$('#Qantas94Heavy-ap-icao > input').val(arrival[0]).change();
				toggle(false);
			}
		} else {
			toggle(false);
			waypoints.nextWaypoint = undefined;
			$('#Qantas94Heavy-ap-icao > input').val('').change();
		}
	}

	/**
	 * Gets the next waypoint that has an altitude restriction
	 *
	 * @returns The index of the waypoint if eligible,
	 * 		   -1 if not eligible
	 * FIXME Potential index confusion: same as the function above
	 */
	function getNextWaypointWithAltRestriction () {
		for (var i = waypoints.nextWaypoint; i < waypoints.route.length; i++) {
			if (waypoints.route[i][3]) return i;
		}
		return -1;
	}

	/**
	 * Helper method for log, formats the time
	 *
	 * @param {Array} time An array of the time: [hours, minutes]
	 * @returns {String} Formatted time: "hours : minutes"
	 */
	function formatTime (time) {
		if (!time[0] || !time[1]) return '-:-';
		time[1] = checkZeros(time[1]);
		return time[0] + ":" + time[1];
	}

	/**
	 * Helper method, format zeros
	 *
	 * @param {Number} i The number to be checked
	 * @returns {String} The original number with 0's added
	 */
	function checkZeros (i) {
		if (i < 10) i = "0" + i;
		return i;
	}

	/**
	 * Helper method to make sure that a time is eligible
	 *
	 * @param {Number} h The hours
	 * @param {Number} m The minutes
	 * @returns {Array} Array of eligible time, [h, m]
	 */
	function timeCheck (h, m) {
		if (m >= 60) {
			m -= 60;
			h++;
		}
		if (h >= 24) h -= 24;
		return [h, m];
	}

	/**
	 * Fixes MDL input changes that use .change() function
	 *
	 * @param {jQuery} e jQuery element
	 */
	function fixInput (e) {
		e.parent().addClass('is-dirty');
	}

	/**
	 * Gets "Estimated Time En-Route"
	 *
	 * @param {Number} d The distance to the destination
	 * @param {Boolean} a Is the aircraft in arrival
	 * @returns {Array} The time after <code>timeCheck(h, m)</code>
	 */
	function getETE (d, a) {
		var hours = d / gefs.aircraft.animationValue.ktas;
		var h = parseInt(hours);
		var m = Math.round(60 * (hours - h));
		if (a) m += Math.round(gefs.aircraft.animationValue.altitude / 4000);
		return timeCheck(h, m);
	}

	/**
	 * Gets "Estimated Time of Arrival"
	 *
	 * @param {Number} hours Hours
	 * @param {Number} minutes Minutes
	 * @returns {Array} The timer after <code>timeCheck(hours, minutes)</code>
	 */
	function getETA (hours, minutes) {
		var date = new Date();
		var h = date.getHours();
		var m = date.getMinutes();
		h += hours;
		m += Number(minutes);
		return timeCheck(h, m);
	}

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

	/**
	 * @private
	 * Gets the climb/descent profile for VNAV
	 *
	 * @returns {Object} The profile needed by VNAV
	 */
	function getVNAVProfile () {
		return gefs.aircraft.setup.fmc
			|| JSON.parse(vnavProfile)[gefs.aircraft.name]
			|| JSON.parse(vnavProfile).DEFAULT;
	}

	return {
		// Variables
		tod: tod,
		VNAV: VNAV,
		arrival: arrival,
		cruise: cruise,
		phase: phase,
		todCalc: todCalc,
		fieldElev: fieldElev,
		// Functions
		updatePhase: updatePhase,
		print: print,
		printNextWaypointInfo: printNextWaypointInfo,
		flightParams: getFlightParameters,
		activateLeg: activateLeg,
		nextWptAltRes: getNextWaypointWithAltRestriction,
		formatTime: formatTime,
		checkZeros: checkZeros,
		timeCheck: timeCheck,
		fixInput: fixInput,
		getETE: getETE,
		getETA: getETA
	};
});
