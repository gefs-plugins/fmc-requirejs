"use strict";

define([
	'math', 'flight', 'bugfix/input', 'nav/progress', 'text!ui/tab-contents/waypoints.html'
], function (math, flight, fixInput, progress, wptInputField) {
	return {
		input: "",
		route: [],
		nextWaypoint: undefined,

		/**
		 * Turns the waypoints into an array
		 *
		 * @returns {Array} The array of waypoint names
		 */
		makeFixesArray: function () {
			var result = [];
			var departureVal = $('#departureInput').val();
			if (departureVal) result.push(departureVal);
			$('.waypoint td:first-child div > input').each(function() {
				result.push($(this).val());
			});
			var arrivalVal = $('#arrivalInput').val();
			if (arrivalVal) result.push(arrivalVal);

			return result;
		},

		/**
		 * Joins the fixes array into a string
		 *
		 * @returns {String} All waypoints, each seperated by a space
		 */
		toFixesString: function () {
			return this.makeFixesArray().join(" ");
		},

		/**
		 * Makes a sharable route
		 *
		 * @returns {String} A sharable route with airports and waypoints,
		 * 					using <code>JSON.stringify</code> method
		 */
		toRouteString: function () {
			var _this = $('.fmc-dep-arr-table-container');
			return JSON.stringify ([
				_this.find('input.dep').val(),
				_this.find('input.arr').val(),
				_this.find('input.fn').val(),
				this.route
			]);
		},

		/**
		 * Accesses autopilot_pp library and find the coordinates for the waypoints
		 *
		 * @param {String} wpt The waypoint to check for eligibility
		 * @returns {Array} Array of coordinates if eligible,
		 *         {Boolean} false otherwise
		 */
		getCoords: function (wpt) {
			// FIXME
			// autopilot_pp update currently not implemented
			// autopilot_pp is an important dependency for FMC
			try {
				autopilot_pp.require('icaoairports');
				autopilot_pp.require('waypoints');
			} catch (e) {
				return undefined;
			}

			if (autopilot_pp.require('icaoairports')[wpt]) {
				return autopilot_pp.require('icaoairports')[wpt];
			} else if (autopilot_pp.require('waypoints')[wpt]) {
				return autopilot_pp.require('waypoints')[wpt];
			} else return undefined;
		},

		/**
		 * Turns the coordinate entered from minutes-seconds format to decimal format
		 *
		 * @param {String} a Coordinate in minutes-seconds format
		 * @returns {Number} Coordinate in decimal format
		 */
		formatCoords: function (a) {
			if (a.indexOf(' ') > -1) {
				var array = a.split(' ');
				var d = Number(array[0]);
				var m = Number(array[1]) / 60;
				var coords;
				if (d < 0) coords = d - m;
				else coords = d + m;
				return coords;
			} else return Number(a);
		},

		/**
		 * Turns a normal waypoints input or shared waypoints string into waypoints
		 *
		 * @param {String} an input of waypoints or a shared/generated route
		 */
		toRoute: function (s) {
			if (s.indexOf('["') !== 0) {
				// var index = s.indexOf('fpl=');  SkyVector disabled
				var isWaypoints = true;
				var departure = $('#wptDeparture')[0].checked;
				var arrival = $('#wptArrival')[0].checked;
				var n = $('#waypoints tbody tr').length - 1;
				var a;
				var str = [];

				str = s.trim().toUpperCase().split(" ");
				for (var i = 0; i < str.length; i++)
						if (str[i].length > 5 || str[i].length < 1 || !(/^\w+$/.test(str[i])))
							isWaypoints = false;

				if (isWaypoints) {
					for (var i = 0; i < n; i++) {
						this.removeWaypoint(1);
					}
					this.route = [];

					if (departure) {
						var wpt = str[0];
						$('#departureInput').val(wpt).change();
						a = 1;
					} else {
						a = 0;
						$('#departureInput').val("").change();
					}
					for (var i = 0; i + a < str.length; i++) {
						this.addWaypoint();
						var wpt = str[i + a];
						$('#waypoints input.wpt:eq(' + i + ')').val(wpt).change();
					}
					if (arrival) {
						var wpt = str[str.length - 1];
						$('#arrivalInput').val(wpt).change();
					}
				} else {
					alert("Invalid Waypoints Input");
				}
			} else this.loadFromSave(s);
		},

		/**
		 * Adds 1 waypoint input field to end of waypoints list
		 */
		addWaypoint: function () {
			this.route.push([]);
			$('.fmc-wpt-list-container tbody').append(wptInputField);
			if (componentHandler) componentHandler.upgradeDom();
		},

		/**
		 * Removes a waypoint
		 *
		 * @param {Number} n The index of which will be removed
		 */
		removeWaypoint: function (n) {
			$('.fmc-wpt-list-container .wpt-row').eq(n).remove();
			this.route.splice((n - 1), 1);
			if (this.nextWaypoint == n) {
				this.nextWaypoint = null;
			}
		},

		/**
		 * Activates a waypoint or deactivates if the waypoint is already activated
		 *
		 * @param {Number} n The index to be activated or deactivated
		 * FIXME Potential index confusion
		 * Should: start with 0; Instead: started with 1
		 */
		activateLeg: function (n) {

			/**
			 * @private
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

			if (this.nextWaypoint != n) {
				if (n < this.route.length) {
					this.nextWaypoint = n;
					var wpt = this.route[this.nextWaypoint];
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

					progress.update(this); // Updates progress: prints general progress info and next waypoint info
					console.log('Waypoint # ' + n + 1 + ' activated | index: ' + n);
				} else {
					$('#Qantas94Heavy-ap-icao > input').val(flight.arrival[0]).change();
					toggle(false);
				}
			} else {
				toggle(false);
				this.nextWaypoint = undefined;
				$('#Qantas94Heavy-ap-icao > input').val('').change();
			}
		},

		/**
		 * Gets the next waypoint that has an altitude restriction
		 *
		 * @returns The index of the waypoint if eligible,
		 * 		   -1 if not eligible
		 * FIXME Potential index confusion: same as the function above
		 */
		getNextWaypointWithAltRestriction: function () {
			for (var i = this.nextWaypoint; i < this.route.length; i++) {
				if (this.route[i][3]) return i;
			}
			return -1;
		},

		/**
		 * Saves the waypoints data into localStorage
		 */
		saveData: function () {
			if (this.route.length < 1 || !this.route[0][0]) {
				alert ("There is no route to save");
			} else {
				localStorage.removeItem('fmcWaypoints');
				var arr = this.toRouteString();
				localStorage.setItem("fmcWaypoints", arr);
			}
		},

		/**
		 * Retrieves the saved data and adds to the waypoint list
		 *
		 * @param {String} arg The generated route
		 */
		loadFromSave: function (arg) {

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
				this.route = [];
				$('.fmc-wpt-list-container .wpt-row').remove();

				var route = arr[3];

				// JSON.stringify turns undefined into null; this loop turns it back
				route.forEach(function (wpt) {
					if (!wpt[3] || wpt[3] === null || wpt[3] === 0) wpt[3] = undefined;
				});

				if (arr[0]) fixInput($('.fmc-dep-arr-table-container input.dep').val(arr[0]).change());
				if (arr[1]) fixInput($('.fmc-dep-arr-table-container input.arr').val(arr[1]).change());
				if (arr[2]) fixInput($('.fmc-dep-arr-table-container input.fn').val(arr[2]).change());

				for (var i = 0; i < route.length; i++) {
					this.addWaypoint();
					// Puts in the waypoint
					fixInput($('.fmc-wpt-list-container input.wpt').eq(i).val(route[i][0]).change());

					// If the waypoint is not eligible or a duplicate
					if (!route[i][4] || !$('.fmc-wpt-list-container input.lat').eq(i).val()) {
						fixInput($('.fmc-wpt-list-container input.lat').eq(i).val(route[i][1]).change()); // Puts in the lat.
						fixInput($('.fmc-wpt-list-container input.lon').eq(i).val(route[i][2]).change()); // Puts in the lon.
					}

					if (route[i][3]) // If there is an altitude restriction
						fixInput($('.fmc-wpt-list-container input.alt').eq(i).val(route[i][3]).change());
				}
				// Auto-saves the data once again
				this.saveData();

			} else alert ("You did not save the waypoints or you cleared the browser's cache");
		},

		/**
		 * Shifts a waypoint up or down one step
		 *
		 * @param {jQuery element} r The element to be moved in the UI
		 * @param {Number} n Index of this waypoint
		 * @param <restricted>{String} d Direction of shifting, "up" or "down"
		 * FIXME Potential index confusion
		 */
		shiftWaypoint: function(r, n, d) {
			console.log("Waypoint #" + (n + 1) + "(index=" + n + ") moved " + d);
			if (!(d === "up" && n === 0 || d === "down" && n === this.route.length - 1)) {
				if (d === "up") {
					this.route.move(n, n - 1);
					r.insertBefore(r.prev());
					if (this.nextWaypoint == n + 1) {
						this.nextWaypoint = n;
					} else if (this.nextWaypoint == n) {
						this.nextWaypoint = n + 2;
					}
					progress.printNextWaypointInfo(this, n);
					progress.printNextWaypointInfo(this, n - 1);
				} else {
					this.route.move(n, n + 1);
					r.insertAfter(r.next());
					if (this.nextWaypoint == n + 1) {
						this.nextWaypoint = n + 2;
					} else if (this.nextWaypoint == n + 2) {
						this.nextWaypoint = n;
					}
					progress.printNextWaypointInfo(this, n + 1);
					progress.printNextWaypointInfo(this, n);
				}
			}
		}
	};
});
