"use strict"; // FIXME

define([
	'knockout', 'debug', 'math', 'get', 'flight', 'log', 'nav/progress', 'exports'
], function (ko, debug, math, get, flight, log, progress, exports) {

	// Autopilt++ Dependencies
	var autopilot = autopilot_pp.require('autopilot'),
		gc = autopilot_pp.require('greatcircle'),
		icao = autopilot_pp.require('json!data/icaoairports.json');

	var route = ko.observableArray();
	var nextWaypoint = ko.observable(null);

	/**
	 * Route object to distinguish between each route item
	 *
	 * @private
	 * @constructor
	 */
	var Route = function () {
		this.data = [
			ko.observable(), // FIX/VOR/ICAO
			ko.observable(), // Latitude
			ko.observable(), // Longitude
			ko.observable(), // Alt. Restriction
			ko.observable(false), // If valid waypoint with coords
			ko.observable('') // Waypoint information
		];
	};

	/**
	 * Defines method to move elements in the route array
	 *
	 * @param {Number} index1 The start index
	 * @param {Number} index2 The end/target index
	 */
	function move (index1, index2) {
		var tempRoute = route();

		if (index2 >= tempRoute.length) {
			var k = index2 - tempRoute.length;
			while ((k--) + 1) {
				tempRoute.push(undefined);
			}
		}
		tempRoute.splice(index2, 0, tempRoute.splice(index1, 1)[0]);

		// Sets tempRoute as the new route
		route(tempRoute);
	}

	/**
	 * Turns the waypoints into an array
	 *
	 * @returns {Array} The array of waypoint names
	 */
	function makeFixesArray () {
		var result = [];

		var departureVal = flight.departure.airport();
		if (departureVal) result.push(departureVal);

		route().forEach(function (wpt) {
			result.push(wpt[0]());
		});

		var arrivalVal = flight.arrival.airport();
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

		var normalizedRoute = [];

		for (var i = 0; i < route().length; i++) {
			var singleRoute = [];
			route()[i].forEach(function (element) {
				singleRoute.push(element());
			});

			normalizedRoute.push(singleRoute);
		}

		return JSON.stringify ([
			flight.departure.airport(),
			flight.arrival.airport(),
			flight.number(),
			normalizedRoute
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

		if (!s) {
			log.warn('Please enter waypoints separated by spaces or a generated route');
			return;
		}

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

		route.removeAll();

		// Departure airport input/clear
		if (departure) {
			var wpt = str[0];
			flight.departure.airport(wpt);
			a = 1;
		} else {
			a = 0;
			flight.departure.airport(undefined);
		}

		// Adds all waypoints into waypoint input area
		for (var i = 0; i + a < str.length; i++) {
			addWaypoint();
			route()[i][0](str[i]);
		}

		// Arrival airpot input/clear
		if (arrival) {
			var wpt = str[str.length - 1];
			flight.arrival.airport(wpt);
		} else flight.arrival.airport(undefined);
	}

	/**
	 * Adds 1 waypoint input field to end of waypoints list
	 */
	function addWaypoint () {
		route.push(new Route().data);
		if (typeof componentHandler === 'object') componentHandler.upgradeDom();
		debug.stopPropagation();
	}

	/**
	 * Removes a waypoint
	 *
	 * @param {Number} n The index of which will be removed
	 * @param {Object} [data] Passed in by knockout
	 * @param {Object} [event] Passed in by knockout
	 */
	function removeWaypoint (n, data, event) { // jshint unused:false
		// debugger;
		if (event.shiftKey) route.removeAll(); // Shift-click: removes all waypoints
		else route.splice(n, 1);

		if (nextWaypoint() === n || event.shiftKey) {
			activateWaypoint(false);
		} else if (nextWaypoint() === n + 1) activateWaypoint(n);
		else if (nextWaypoint() > n) nextWaypoint(nextWaypoint() - 1);
	}

	/**
	 * Activates a waypoint or deactivates if the waypoint is already activated
	 *
	 * @param {Number} n The index (starts with 0) to be activated or deactivated
	 *		{Boolean} If false, deactivates all waypoints
	 */
	function activateWaypoint (n) {
		if (n !== false && nextWaypoint() !== n) {
			if (n < route().length) {
				nextWaypoint(n);
				var wpt = route()[nextWaypoint()];

				// FIXME once waypoint mode is fixed, convert to waypoint mode
				gc.latitude(wpt[1]());
				gc.longitude(wpt[2]());
				autopilot.currentMode(1); // Switches to Lat/Lon mode

				progress.update(); // Updates progress: prints general progress info and next waypoint info
				debug.log('Waypoint # ' + Number(n + 1) + ' activated | index: ' + n);
			} else {
				// FIXME once waypoint mode is fixed, convert to waypoint mode
				if (flight.arrival.coords[1]) {
					gc.latitude(flight.arrival.coords[1]);
					gc.longitude(flight.arrival.coords[2]);
				}
				nextWaypoint(-1);
			}
		} else {
			nextWaypoint(null);
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
		route()[index][5](info);
	}

	/**
	 * Gets the next waypoint that has an altitude restriction
	 *
	 * @returns {Number} The index of the waypoint if eligible,
	 * 		   -1 if not eligible
	 */
	function getNextWaypointWithAltRestriction () {
		for (var i = nextWaypoint(); i < route().length; i++) {
			if (route()[i]() && route()[i][3]()) return i;
		}
		return -1;
	}

	/**
	 * Saves the waypoints data into localStorage
	 */
	function saveData () {
		if (route().length < 1 || !route()[0][0]()) {
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
			route.removeAll();

			var rte = arr[3];

			// JSON.stringify turns undefined into null; this loop turns it back
			rte.forEach(function (wpt) {
				if (!wpt[3] || wpt[3] === null) wpt[3] = undefined;
			});

			if (arr[0]) flight.departure.airport(arr[0]);
			if (arr[1]) flight.arrival.airport(arr[1]);
			if (arr[2]) flight.number(arr[2]);

			for (var i = 0; i < rte.length; i++) {
				addWaypoint();

				// Puts in the waypoint
				if (rte[i][0]) route()[i][0](rte[i][0]);

				// If the waypoint is not eligible or a duplicate
				if (!rte[i][4] || !route()[i][1]()) {
					if (rte[i][1]) route()[i][1](rte[i][1]); // Puts in the lat.
					if (rte[i][2]) route()[i][3](rte[i][2]); // Puts in the lon.
				}

				if (rte[i][3]) // If there is an altitude restriction
					route()[i][3](rte[i][3]);
			}
			// Auto-saves the data once again
			saveData();

		} else log.warn("You did not save the waypoints or you cleared the browser's cache");
	}

	/**
	 * Shifts a waypoint up or down one step
	 *
	 * @param {Number} oldIndex Index of this waypoint
	 * @param {Number} value Direction (+/-) and quantity moved
	 * FIXME Potential index confusion
	 */
	function shiftWaypoint (oldIndex, value) {
		debug.log("Waypoint #" + (oldIndex + 1) + "(index=" + oldIndex + ") shifted " + value);

		var newIndex = oldIndex + value;

		// If waypoint is shifting up (negative value)
		if (value < 0 && newIndex >= 0) {
			move(oldIndex, newIndex);

			if (nextWaypoint() === newIndex) {
				activateWaypoint(oldIndex);
			} else if (nextWaypoint() === oldIndex) {
				activateWaypoint(newIndex);
			}
		}

		// If waypoint is shifting down (positive value)
		else if (value > 0 && newIndex <= route().length - 1) {
			move(oldIndex, newIndex);

			if (nextWaypoint() === oldIndex) {
				activateWaypoint(newIndex);
			} else if (nextWaypoint() === newIndex) {
				activateWaypoint(oldIndex);
			}
		}

	}
	// Variables
	exports.route = route;
	exports.nextWaypoint = nextWaypoint;

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
