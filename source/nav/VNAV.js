"use strict";

define(['debug', 'distance', 'flight', 'utils', 'waypoints'], function (debug, distance, flight, utils, waypoints) {

	// Autopilot++ Dependencies
	var apModes = autopilot_pp.require('autopilot').modes;

	return {
		timer: null,

		/**
		 * Controls VNAV, plane's vertical navigation, set on a timer
		 */
		update: function () {
			if (!flight.vnavEnabled()) return;

			var route = waypoints.route();

			var params = flight.parameters();

			var next = waypoints.nextWptAltRes();
			var hasRestriction = next !== -1;

			var todDist = flight.todDist();
			var cruiseAlt = flight.cruiseAlt();
			var fieldElev = flight.fieldElev();
			var todCalc = flight.todCalc();

			var currentAlt = geofs.aircraft.instance.animationValue.altitude;
			var targetAlt, deltaAlt, nextDist, targetDist;
			if (hasRestriction) {
				targetAlt = route[next].alt();
				deltaAlt = targetAlt - currentAlt;
				nextDist = distance.route(next);
				targetDist = distance.target(deltaAlt);
				debug.log('targetAlt: ' + targetAlt + ', deltaAlt: ' + deltaAlt + ', nextDist: ' + nextDist + ', targetDist: ' + targetDist);
			}

			var spd, vs, alt;

			/**********************
			 * Flight Phase Logic *
			 **********************/
			var lat1 = geofs.aircraft.instance.llaLocation[0] || null;
			var lon1 = geofs.aircraft.instance.llaLocation[1] || null;
			var lat2 = flight.arrival.coords()[0] || null;
			var lon2 = flight.arrival.coords()[1] || null;
			var flightDist;

			// Checks if the whole route is complete
			for (var i = 0, valid = true; i < route.length; i++) {
				if (!route[i].lat() || !route[i].lon()) valid = false;
			}
			if (valid) flightDist = distance.route(route.length);
			else flightDist = utils.getDistance(lat1, lon1, lat2, lon2);

			// Invalid distance, phase resets to default = climb
			if (isNaN(flightDist)) flight.phase(0);

			// Total route dist is less than T/D distance, phase = descent
			else if (flightDist < todDist) flight.phase(2);

			// If current altitude is close to the cruise altitude, phase = cruise
			else if (Math.abs(cruiseAlt - currentAlt) <= 100) flight.phase(1);

			// If current altitude is less than cruise altitude, phase = climb
			else if (currentAlt < cruiseAlt) flight.phase(0);

			// If current altitude is greater than cruise altitude
			// This means that cruise altitude is lowered during cruise
			// Phase still is cruise, but assign V/S value
			else if (currentAlt > cruiseAlt) {
				flight.phase(1);
				vs = -1000;
			}

			// Else, resets to default phase = climb
			else flight.phase(0);

			// ==============================

			if (flight.spdControl()) spd = params[0];

			var phase = flight.phase();

			// If the aircraft is climbing
			if (phase === 0) {

				// If there is an altitude restriction somewhere on the route
				if (hasRestriction) {
					var totalDist = distance.target(cruiseAlt - currentAlt) + distance.target(targetAlt - cruiseAlt);
					debug.log('totalDist: ' + totalDist);

					// Checks to see if the altitude restriction is on the climbing phase or descent phase
					if (nextDist < totalDist) {
						if (nextDist < targetDist) vs = utils.getClimbrate(deltaAlt, nextDist);
						else vs = params[1];
						alt = targetAlt;
					} else {
						vs = params[1];
						alt = cruiseAlt;
					}
				}

				// If there are no altitude restrictions left on the route
				else {
					vs = params[1];
					alt = cruiseAlt;
				}
			}

			// If the aircraft is on descent
			else if (phase === 2) {

				// If there is an altitude restriction somewhere on the route
				if (hasRestriction) {

					// If targetDist has been reached
					if (nextDist < targetDist) {
						vs = utils.getClimbrate(deltaAlt, nextDist);
						alt = targetAlt;
					}

					// If targetDist hasn't been reached do nothing until it has been reached
				}

				// If there are no altitude restrictions left on the route
				else {
					vs = params[1];
					if (currentAlt > 12000 + fieldElev) alt = 100 * Math.round((12000 + fieldElev) / 100);
				}
			}

			// Calculates Top of Descent
			if (phase === 1 && (todCalc || !todDist)) {
				if (hasRestriction) {
					todDist = distance.route(route.length) - nextDist;
					todDist += distance.target(targetAlt - cruiseAlt);
				} else {
					todDist = distance.target(fieldElev - cruiseAlt);
				}
				todDist = Math.round(todDist);
				flight.todDist(todDist);
				debug.log('TOD changed to ' + todDist);
			}

			// Updates SPD, VS, and ALT in Autopilot++ if new values exist
			if (spd) apModes.speed.value(spd);
			if (vs) apModes.vs.value(vs);
			if (alt) apModes.altitude.value(alt);
		}
	};
});
