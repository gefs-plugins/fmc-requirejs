"use strict";

define(['distance', 'flight', 'math', 'waypoints', 'nav/progress'], function (distance, flight, math, waypoints, progress) {
	return {
		timer: null,

		/**
		 * Controls VNAV, plane's vertical navigation, set on a timer
		 */
		update: function () {
			var route = waypoints.route;

			var params = flight.flightParams();

			var next = waypoints.nextWptAltRes();
			var hasRestriction = next !== -1;

			var tod = flight.tod;
			var cruiseAlt = flight.cruiseAlt;
			var fieldElev = flight.fieldElev;
			var phase = flight.phase;
			var todCalc = flight.todCalc;

			var currentAlt = geofs.aircraft.instance.animationValue.altitude;
			var targetAlt, deltaAlt, nextDist, targetDist;
			if (hasRestriction) {
				targetAlt = route[next - 1][3];
				deltaAlt = targetAlt - currentAlt;
				nextDist = distance.route(next);
				targetDist = distance.target(deltaAlt);
				console.log('targetAlt: ' + targetAlt + ', deltaAlt: ' + deltaAlt + ', nextDist: ' + nextDist + ', targetDist: ' + targetDist);
			}

			var spd, vs, alt;
			if (flight.spdControl) spd = params[0];

			// If the aircraft is climbing
			if (phase == "climb") {

				// If there is an altitude restriction somewhere on the route
				if (hasRestriction) {
					var totalDist = distance.target(cruiseAlt - currentAlt) + distance.target(targetAlt - cruiseAlt);
					console.log("totalDist: " + totalDist);

					// Checks to see if the altitude restriction is on the climbing phase or descent phase
					if (nextDist < totalDist) {
						if (nextDist < targetDist) vs = math.getClimbrate(deltaAlt, nextDist);
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
			else if (phase == "descent") {

				// If there is an altitude restriction somewhere on the route
				if (hasRestriction) {

					// If targetDist has been reached
					if (nextDist < targetDist) {
						vs = math.getClimbrate(deltaAlt, nextDist);
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
			if (phase === "cruise" && (todCalc || !tod)) {
				if (hasRestriction) {
					tod = distance.route(route.length) - nextDist;
					tod += distance.target(targetAlt - cruiseAlt);
				} else {
					tod = distance.target(fieldElev - cruiseAlt);
				}
				tod = Math.round(tod);
				$('#todInput').val('' + tod).change();
				console.log('TOD changed to ' + tod);
			}

			// Updates SPD, VS, and ALT in Autopilot++ if new values exist
			if (spd) $('#Qantas94Heavy-ap-spd > input').val('' + spd).change();
			if (vs) $('#Qantas94Heavy-ap-vs > input').val('' + vs).change();
			if (alt) $('#Qantas94Heavy-ap-alt > input').val('' + alt).change();

			// Updates tod
			flight.tod = tod;

			// Updates flight phase
			progress.updatePhase();
		}
	};
});
