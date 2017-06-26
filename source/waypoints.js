"use strict"; // A big FIXME right here

define([
	'bugfix', 'math', 'flight', 'nav/progress', 'ui/elements', 'minify!html/waypoints.html', 'exports'
], function (bugfix, math, flight, progress, E, wptInputField, exports) {

	// Autopilt++ Dependencies
	var getWaypoint = autopilot_pp.require('getwaypoint');

	var container = E.container,
		btn = E.btn,
		input = E.input;

	exports.route = [];
	exports.nextWaypoint = null;

	/**
	 * Defines method to move elements in the route array
	 *
	 * @param {Number} index1 The start index
	 * @param {Number} index2 The end/target index
	 */
	function move (index1, index2) {
		if (index2 >= exports.route.length) {
			var k = index2 - exports.route.length;
			while ((k--) + 1) {
				exports.route.push(undefined);
			}
		}
		exports.route.splice(index2, 0, exports.route.splice(index1, 1)[0]);
		return exports.route;
	}

	/**
	 * Turns the waypoints into an array
	 *
	 * @returns {Array} The array of waypoint names
	 */
	function makeFixesArray () {
		var result = [];

		var departureVal = $(input.dep).val();
		if (departureVal) result.push(departureVal);

		exports.route.forEach(function (wpt) {
			result.push(wpt[0]);
		});

		var arrivalVal = $(input.arr).val();
		if (arrivalVal) result.push(arrivalVal);

		return result;
	}

	/**
	 * Joins the fixes array into a string
	 *
	 * @returns {String} All waypoints, each seperated by a space
	 */
	function toFixesString () {
		return makeFixesArray().join(' ');
	}

	/**
	 * Makes a sharable route
	 *
	 * @returns {String} A sharable route with airports and waypoints,
	 * 					using `JSON.stringify` method
	 */
	function toRouteString () {
		return JSON.stringify ([
			$(input.dep).val(),
			$(input.arr).val(),
			$(input.fn).val(),
			exports.route
		]);
	}

	/**
	 * Accesses autopilot_pp library and find the coordinates for the waypoints
	 *
	 * @param {String} wpt The waypoint to check for eligibility
	 * @returns {Array} Array of coordinates if eligible,
	 *         {Boolean} false otherwise
	 */
	function getCoords (wpt) {
		return getWaypoint(wpt);
	}

	/**
	 * Turns the coordinate entered from minutes-seconds format to decimal format
	 *
	 * @param {String} a Coordinate in minutes-seconds format
	 * @returns {Number} Coordinate in decimal format
	 */
	function formatCoords (a) {
		if (a.indexOf(' ') > -1) {
			var array = a.split(' ');
			var d = Number(array[0]);
			var m = Number(array[1]) / 60;
			var coords;
			if (d < 0) coords = d - m;
			else coords = d + m;
			return coords;
		} else return Number(a);
	}

	/**
	 * Turns a normal waypoints input or shared waypoints string into waypoints
	 *
	 * @param {String} s Input of waypoints or a shared/generated route
	 */
	function toRoute (s) {
		if (s.indexOf('["') !== 0) {
			// var index = s.indexOf('fpl=');  SkyVector disabled
			var isWaypoints = true;
			var departure = $('#wptDeparture')[0].checked;
			var arrival = $('#wptArrival')[0].checked;
			var n = exports.route.length - 1; // FIXME index error
			var a;
			var str = [];

			str = s.trim().toUpperCase().split(" ");
			for (var i = 0; i < str.length; i++)
					if (str[i].length > 5 || str[i].length < 1 || !(/^\w+$/.test(str[i])))
						isWaypoints = false;

			if (isWaypoints) {
				for (var i = 0; i < n; i++) {
					removeWaypoint(1);
				}
				exports.route = [];

				if (departure) {
					$(input.dep).val(str[0]).change();
					a = 1;
				} else {
					a = 0;
					$(input.dep).val('').change();
				}
				for (var i = 0; i + a < str.length; i++) {
					addWaypoint();
					$(input.wpt).eq(i).val(str[i+a]).change();
				}
				if (arrival) {
					var wpt = str[str.length - 1];
					$(input.arr).val(wpt).change();
				}
			} else {
				console.error('Invalid Waypoints Input');
			}
		} else loadFromSave(s);
	}

	/**
	 * Adds 1 waypoint input field to end of waypoints list
	 */
	function addWaypoint () {
		exports.route.push([]);
		$(container.wptList).find('tbody').append(wptInputField);
		if (typeof componentHandler === 'object') componentHandler.upgradeDom();
		bugfix.stopPropagation();
	}

	/**
	 * Removes a waypoint
	 *
	 * @param {Number} n The index of which will be removed
	 */
	function removeWaypoint (n) {
		$(container.wptRow).eq(n).remove();
		exports.route.splice(n, 1);
		if (exports.nextWaypoint == n) {
			exports.nextWaypoint = null;
		}

		if (exports.route.length !== 0) {
			if (n === exports.route.length ) {
				if (exports.route[n - 1])
					progress.printNextWaypointInfo(n - 1);
			} else {
				if (exports.route[n])
					progress.printNextWaypointInfo(n);
			}
		}
	}

	/**
	 * Activates a waypoint or deactivates if the waypoint is already activated
	 *
	 * @param {Number} n The index (starts with 0) to be activated or deactivated
	 */
	function activateWaypoint (n) {

		/**
		 * @private
		 * Toggles activated buttons
		 *
		 * @param {Boolean} toggleOn Whether the action is to toggle on
		 */
		var toggle = function (toggleOn) {
			if (toggleOn) {
				$(btn.activateWpt)
					.eq(n).removeClass('mdl-button--colored')
					.addClass('mdl-button--accent')
					.children().text('check_circle');
			} else {
				$(btn.activateWpt)
					.removeClass('mdl-button--accent')
					.addClass('mdl-button--colored')
					.children().text('check');
			}
		};

		if (exports.nextWaypoint != n) {
			if (n < exports.route.length) {
				exports.nextWaypoint = n;
				var wpt = exports.route[exports.nextWaypoint];

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
				$('#Qantas94Heavy-ap-icao > input').val(flight.arrival[0]).change();
				toggle(false);
			}
		} else {
			toggle(false);
			exports.nextWaypoint = null;
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
		for (var i = exports.nextWaypoint; i < exports.route.length; i++) {
			if (exports.route[i] && exports.route[i][3]) return i;
		}
		return -1;
	}

	/**
	 * Saves the waypoints data into localStorage
	 */
	function saveData () {
		if (exports.route.length < 1 || !exports.route[0][0]) {
			alert ("There is no route to save");
		} else {
			localStorage.removeItem('fmcWaypoints');
			var arr = toRouteString();
			localStorage.setItem("fmcWaypoints", arr);
		}
	}

	/**
	 * Retrieves the saved data and adds to the waypoint list
	 *
	 * @param {String} arg The generated route
	 */
	function loadFromSave (arg) {

	/**
	 * The argument passed in [optional] or the localStorage is a
	 * 3D array in String format. arr is the array after JSON.parse
	 *
	 * @param {String} arr[0] Departure input
	 * @param {String} arr[1] Arrival Input
	 * @param {String} arr[2] Flight Number
	 * @param {Array} arr[3] 2D array, the route
	 */

		arg = arg || localStorage.getItem('fmcWaypoints');
		var arr = JSON.parse(arg);
		localStorage.removeItem('fmcWaypoints');

		if (arr) {
			// Clears all
			exports.route = [];
			$(container.wptRow).remove();

			var rte = arr[3];

			// JSON.stringify turns undefined into null; this loop turns it back
			rte.forEach(function (wpt) {
				if (!wpt[3] || wpt[3] === null || wpt[3] === 0) wpt[3] = undefined;
			});

			if (arr[0]) bugfix.input($(input.dep).val(arr[0]).change());
			if (arr[1]) bugfix.input($(input.arr).val(arr[1]).change());
			if (arr[2]) bugfix.input($(input.fn).val(arr[2]).change());

			for (var i = 0; i < rte.length; i++) {
				addWaypoint();
				// Puts in the waypoint
				if (rte[i][0]) bugfix.input($(input.wpt).eq(i).val(rte[i][0]).change());

				// If the waypoint is not eligible or a duplicate
				if (!rte[i][4] || !$(input.lat).eq(i).val()) {
					if (rte[i][1]) bugfix.input($(input.lat).eq(i).val(rte[i][1]).change()); // Puts in the lat.
					if (rte[i][1]) bugfix.input($(input.lon).eq(i).val(rte[i][2]).change()); // Puts in the lon.
				}

				if (rte[i][3]) // If there is an altitude restriction
					bugfix.input($(input.alt).eq(i).val(rte[i][3]).change());
			}
			// Auto-saves the data once again
			saveData();

		} else alert ("You did not save the waypoints or you cleared the browser's cache");
	}

	/**
	 * Shifts a waypoint up or down one step
	 *
	 * @param {jQuery} r The element to be moved in the UI
	 * @param {Number} n Index of this waypoint
	 * @param {String} d Direction of shifting, "up" or "down"
	 * FIXME Potential index confusion
	 */
	function shiftWaypoint (r, n, d) {
		console.log("Waypoint #" + (n + 1) + "(index=" + n + ") moved " + d);
		if (!(d === "up" && n === 0 || d === "down" && n === exports.route.length - 1)) {
			if (d === "up") {
				move(n, n - 1);
				r.insertBefore(r.prev());
				if (exports.nextWaypoint == n + 1) {
					exports.nextWaypoint = n;
				} else if (exports.nextWaypoint == n) {
					exports.nextWaypoint = n + 2;
				}
				progress.printNextWaypointInfo(n);
				progress.printNextWaypointInfo(n - 1);
			} else {
				move(n, n + 1);
				r.insertAfter(r.next());
				if (exports.nextWaypoint == n + 1) {
					exports.nextWaypoint = n + 2;
				} else if (exports.nextWaypoint == n + 2) {
					exports.nextWaypoint = n;
				}
				progress.printNextWaypointInfo(n + 1);
				progress.printNextWaypointInfo(n);
			}
		}
	}

	// Functions
	exports.move = move;
	exports.makeFixesArray = makeFixesArray;
	exports.toFixesString = toFixesString;
	exports.toRouteString = toRouteString;
	exports.getCoords = getCoords;
	exports.formatCoords = formatCoords;
	exports.toRoute = toRoute;
	exports.addWaypoint = addWaypoint;
	exports.removeWaypoint = removeWaypoint;
	exports.activateWaypoint = activateWaypoint;
	exports.nextWptAltRes = getNextWaypointWithAltRestriction;
	exports.saveData = saveData;
	exports.loadFromSave = loadFromSave;
	exports.shiftWaypoint = shiftWaypoint;

});
