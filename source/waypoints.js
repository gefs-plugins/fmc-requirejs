"use strict";

define([
	'debug', 'math', 'get', 'flight', 'log', 'nav/progress',
	'ui/elements', 'minify!html/waypoints.html', 'exports'
], function (debug, math, get, flight, log, progress, E, wptInputField, exports) {

	// Autopilt++ Dependencies
	var autopilot = autopilot_pp.require('autopilot'),
		gc = autopilot_pp.require('greatcircle'),
		icao = autopilot_pp.require('json!data/icaoairports.json');

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
		// If it is a generated route
		if (s.indexOf('["') === 0) {
			loadFromSave(s);
			return;
		}

		var isWaypoints = true;
		var a, str = [];

		str = s.trim().toUpperCase().split(' ');

		// Check if inputs are valid
		for (var i = 0; i < str.length; i++)
				if (str[i].length > 5 || str[i].length < 1 || !(/^\w+$/.test(str[i])))
					isWaypoints = false;

		// If the first or last is departure or arrival airport
		var departure = !!icao[str[0]];
		var arrival = !!icao[str[str.length - 1]];

		// If input is invalid, exit function call
		if (!isWaypoints) {
			log.warn('Invalid Waypoints Input');
			return;
		}

		// Removes all current waypoints
		$(E.container.wptRow).remove();
		exports.route = [];

		// Departure airport input/clear
		if (departure) {
			debug.input($(input.dep).val(str[0]).change());
			a = 1;
		} else {
			a = 0;
			$(input.dep).val('').change().parent().removeClass('is-dirty');
		}

		// Adds all waypoints into waypoint input area
		for (var i = 0; i + a < str.length; i++) {
			addWaypoint();
			debug.input($(input.wpt).eq(i).val(str[i+a]).change());
		}

		// Arrival airpot input/clear
		if (arrival) {
			var wpt = str[str.length - 1];
			debug.input($(input.arr).val(wpt).change());
		} else $(input.arr).val('').change().parent().removeClass('is-dirty');
	}

	/**
	 * Adds 1 waypoint input field to end of waypoints list
	 */
	function addWaypoint () {
		exports.route.push([]);
		$(container.wptList).find('tbody').append(wptInputField);
		if (typeof componentHandler === 'object') componentHandler.upgradeDom();
		debug.stopPropagation();
	}

	/**
	 * Removes a waypoint
	 *
	 * @param {Number} n The index of which will be removed
	 */
	function removeWaypoint (n) {
		$(container.wptRow).eq(n).remove();
		exports.route.splice(n, 1);
		if (exports.nextWaypoint === n) {
			exports.nextWaypoint = null;
			gc.latitude(undefined);
			gc.longitude(undefined);
			autopilot.currentMode(0);
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

		if (exports.nextWaypoint !== n) {
			if (n < exports.route.length) {
				exports.nextWaypoint = n;
				var wpt = exports.route[exports.nextWaypoint];

				// FIXME once waypoint mode is fixed, convert to waypoint mode
				gc.latitude(wpt[1]);
				gc.longitude(wpt[2]);
				autopilot.currentMode(1); // Switches to Lat/Lon mode

				toggle(false);
				toggle(true);

				progress.update(); // Updates progress: prints general progress info and next waypoint info
				debug.log('Waypoint # ' + Number(n + 1) + ' activated | index: ' + n);
			} else {
				// FIXME once waypoint mode is fixed, convert to waypoint mode
				if (flight.arrival[1]) {
					gc.latitude(flight.arrival[1]);
					gc.longitude(flight.arrival[2]);
				}

				toggle(false);
			}
		} else {
			toggle(false);
			exports.nextWaypoint = null;
			gc.latitude(undefined);
			gc.longitude(undefined);
			autopilot.currentMode(0);
		}
	}

	/**
	 * Prints waypoint info to info section above each waypoint
	 * Applies to ROUTE [and LEGS] TODO
	 * Record in route array
	 *
	 * @param {Number} index The index of the element
	 * @param {String} info
	 */
	function printWaypointInfo (index, info) {
		if (!info) info = '';
		$(E.container.wptInfo).eq(index).text(info);
		exports.route[index][5] = info;
	}

	/**
	 * Gets the next waypoint that has an altitude restriction
	 *
	 * @returns {Number} The index of the waypoint if eligible,
	 * 		   -1 if not eligible
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
			log.warn("There is no route to save");
		} else {
			localStorage.removeItem('fmcWaypoints');
			localStorage.setItem("fmcWaypoints", toRouteString());
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
	 * @param {String} arg Parses into {Array} arr
	 *
	 * 			{String} arr[0] Departure input,
	 *  		{String} arr[1] Arrival Input,
	 *  		{String} arr[2] Flight Number,
	 *  		{Array} arr[3] 2D array, the route
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
				if (!wpt[3] || wpt[3] === null) wpt[3] = undefined;
			});

			if (arr[0]) debug.input($(input.dep).val(arr[0]).change());
			if (arr[1]) debug.input($(input.arr).val(arr[1]).change());
			if (arr[2]) debug.input($(input.fn).val(arr[2]).change());

			for (var i = 0; i < rte.length; i++) {
				addWaypoint();

				// Puts in the waypoint
				if (rte[i][0]) debug.input($(input.wpt).eq(i).val(rte[i][0]).change());

				// If the waypoint is not eligible or a duplicate
				if (!rte[i][4] || !$(input.lat).eq(i).val()) {
					if (rte[i][1]) debug.input($(input.lat).eq(i).val(rte[i][1]).change()); // Puts in the lat.
					if (rte[i][2]) debug.input($(input.lon).eq(i).val(rte[i][2]).change()); // Puts in the lon.
				}

				if (rte[i][3]) // If there is an altitude restriction
					debug.input($(input.alt).eq(i).val(rte[i][3]).change());
			}
			// Auto-saves the data once again
			saveData();

		} else log.warn("You did not save the waypoints or you cleared the browser's cache");
	}

	/**
	 * Shifts a waypoint up or down one step
	 *
	 * @param {jQuery} $j The element to be moved in the UI
	 * @param {Number} oldIndex Index of this waypoint
	 * @param {Number} value Direction (+/-) and quantity moved
	 * FIXME Potential index confusion
	 */
	function shiftWaypoint ($j, oldIndex, value) {
		debug.log("Waypoint #" + (oldIndex + 1) + "(index=" + oldIndex + ") shifted " + value);

		var newIndex = oldIndex + value;

		// If waypoint is shifting up (negative value)
		if (value < 0 && newIndex >= 0) {
			move(oldIndex, newIndex);

			for (var i = 0, $e = $j; i < -value; i++) $e = $e.prev();
			$j.insertBefore($e);

			if (exports.nextWaypoint === newIndex) {
				exports.nextWaypoint = oldIndex;
			} else if (exports.nextWaypoint === oldIndex) {
				exports.nextWaypoint = newIndex;
			}
		}

		// If waypoint is shifting down (positive value)
		else if (value > 0 && newIndex <= exports.route.length - 1) {
			move(oldIndex, newIndex);

			for (var i = 0, $e = $j; i < value; i++) $e = $e.next();
			$j.insertAfter($e);

			if (exports.nextWaypoint === oldIndex) {
				exports.nextWaypoint = newIndex;
			} else if (exports.nextWaypoint === newIndex) {
				exports.nextWaypoint = oldIndex;
			}
		}

	}

	// Functions
	exports.move = move;
	exports.makeFixesArray = makeFixesArray;
	exports.toFixesString = toFixesString;
	exports.toRouteString = toRouteString;
	exports.getCoords = get.waypoint;
	exports.formatCoords = formatCoords;
	exports.toRoute = toRoute;
	exports.addWaypoint = addWaypoint;
	exports.removeWaypoint = removeWaypoint;
	exports.activateWaypoint = activateWaypoint;
	exports.printWaypointInfo = printWaypointInfo;
	exports.nextWptAltRes = getNextWaypointWithAltRestriction;
	exports.saveData = saveData;
	exports.loadFromSave = loadFromSave;
	exports.shiftWaypoint = shiftWaypoint;

});
