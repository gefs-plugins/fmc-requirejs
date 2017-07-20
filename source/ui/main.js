"use strict"; // jshint unused:false

define([
	'knockout', './ViewModel', 'debug', 'distance', 'flight', 'log', 'map', 'math', 'waypoints',
	'nav/LNAV', 'nav/progress', './elements', 'redefine', './position'
], function (ko, ViewModel, debug, distance, flight, log, map, math, waypoints, lnav, progress, E) {

	// Checks if UI has been properly placed
	var timer = setInterval(function () {
		if ($(E.modal)[0] && $(E.btn.fmcBtn)) {
			clearInterval(timer);
			loadFMC();
		}
	}, 4);

	// FMC actions init function
	function loadFMC () {
		var modal = E.modal,
			container = E.container,
			btn = E.btn,
			input = E.input,
			textarea = E.textarea;

		// Applies knockout bindings
		window.debugVM = new ViewModel();
		ko.applyBindings(window.debugVM, $(E.modal)[0]);

		// Adds one input field on start
		waypoints.addWaypoint();

		/* ---- UI actions binding ---- */

		// -----------------------------------------
		// ------------- General Modal -------------
		// -----------------------------------------

		// Modal actions: open/close
		$(modal).on('click', btn.close, function () {
			$(modal).removeClass('opened');
		}).parent().on('click', btn.fmcBtn, function () {
			if ($(modal).hasClass('opened')) $(modal).removeClass('opened');
			else $(modal).addClass('opened');
		}).keydown(function (event) { // Sets escape button to close FMC
			if ((event.which === 27 || event.keyCode === 27) && $(this).is(':visible'))
				$(modal).removeClass('opened');
		});

		// Modal tab contents: toggle
		$(container.tabBar).on('click', 'a', function (event) {
			event.preventDefault();
			var c = 'is-active';
			var $this = $(this);
			var $that = $(container.tabBar).find('.' + c);
			var interactive = $this.attr('interactive');

			// Interactive actions button
			$(btn.interactive).removeClass(c);
			if (interactive) $(interactive).addClass(c);

			$(container.modalContent).find($that.attr('to')).removeClass(c);
			$(container.modalContent).find($this.attr('to')).addClass(c);
			$that.removeClass(c);
			$this.addClass(c);
		});

		// ---------------------------------------
		// -------------- ROUTE TAB --------------
		// ---------------------------------------

		// Save/retrieve waypoints data
		$(modal).on('click', btn.saveWptData, function () {
			waypoints.saveData();
		}).on('click', btn.retrieveWpt, function () {
			waypoints.loadFromSave();
		});

		// Waypoint list actions: activate/add/remove/move up or down
		// FIXME potential item index confusion/mess up
		$(modal).on('click', btn.addWpt, function () {
			waypoints.addWaypoint();
		}).on('click', btn.activateWpt, function () {
			var index = $(this).parents().eq(1).index() - 1;
			waypoints.activateWaypoint(index);
			lnav.update();
		}).on('click', btn.removeWpt, function () {
			var index = $(this).parents().eq(1).index() - 1;
			waypoints.removeWaypoint(index);
		}).on('click', btn.moveWptUp, function () {
			var row = $(this).parents().eq(1);
			waypoints.shiftWaypoint(row, row.index() - 1, -1);
		}).on('click', btn.moveWptDown, function () {
			var row = $(this).parents().eq(1);
			waypoints.shiftWaypoint(row, row.index() - 1, 1);
		});

		// Arrival airport input
		// $(container.depArr).on('change', input.arr, function () {
		// 	var wpt = $(this).val().trim();
		// 	if (wpt) {
		// 		var coords = waypoints.getCoords(wpt);
		// 		if (coords) flight.arrival = [wpt, coords[0], coords[1]];
		// 		else flight.arrival = [];
		// 	} else flight.arrival = [];
		// 	lnav.update();
		// });

		// Waypoint list input actions: update `route` array
		$(container.wptList).on('change', input.wpt, function () {
			var index = $(this).parents().eq(2).index() - 1;

			if (!$(this).parent().hasClass('is-invalid')) {
				var wpt = $(this).val().trim().toUpperCase();
				var coords = waypoints.getCoords(wpt);
				if (!coords) {
					$(this).parents().eq(2).find(input.lat).val('').change().parent().removeClass('is-dirty');
					$(this).parents().eq(2).find(input.lon).val('').change().parent().removeClass('is-dirty');
					$(this).parents().eq(2).find(input.alt).val('').change().parent().removeClass('is-dirty');
					waypoints.route[index] = [wpt, undefined, undefined, undefined, false, ''];
				} else {
					debug.input($(this).parents().eq(2).find(input.lat).val(coords[0]).change());
					debug.input($(this).parents().eq(2).find(input.lon).val(coords[1]).change());
					$(this).parents().eq(2).find(input.alt).val('').change().parent().removeClass('is-dirty');
					waypoints.route[index] = [wpt, coords[0], coords[1], undefined, true, ''];
					waypoints.printWaypointInfo(index, coords[2]);
				}
			}
		}).on('change', input.lat, function () {
			var index = $(this).parents().eq(2).index() - 1;

			// If lat input is invalid
			if ($(this).parent().hasClass('is-invalid') || !$(this).val() || $(this).val() === '') {
				waypoints.route[index][1] = undefined;
			} else {
				waypoints.route[index][1] = waypoints.formatCoords($(this).val());
				waypoints.route[index][4] = false;
				waypoints.route[index][5] = '';
			}
		}).on('change', input.lon, function () {
			var index = $(this).parents().eq(2).index() - 1;

			// If lon input is invalid
			if ($(this).parent().hasClass('is-invalid') || !$(this).val() || $(this).val() === '') {
				waypoints.route[index][2] = undefined;
			} else {
				waypoints.route[index][2] = waypoints.formatCoords($(this).val());
				waypoints.route[index][4] = false;
				waypoints.route[index][5] = '';
			}
		}).on('change', input.alt, function () {
			var index = $(this).parents().eq(2).index() - 1;

			if (!$(this).parent().hasClass('is-invalid')) waypoints.route[index][3] = Number($(this).val());
		 	else waypoints.route[index][3] = undefined;
		});

		// ----------------------------------------
		// --------------- LOAD TAB ---------------
		// ----------------------------------------

		// Loads waypoints separated by spaces or generated route
		$(container.loadPage).on('click', btn.loadWpt, function () {
			waypoints.toRoute($(input.loadWpt).val().trim());
		});

		// Disables editing on the generated route textarea
		$(textarea.generateRte).prop('disabled', true);

		// Generates an FMC route to the textarea
		$(modal).on('click', btn.generateRte, function () {
			debug.input($(textarea.generateRte).val(waypoints.toRouteString()).change());
		}).on('click', btn.clearRte, function () {
			$(textarea.generateRte).val('').change().parent().removeClass('is-dirty');
		});


		/* ---- All Initializations ---- */

		// Initializes all timers
		progress.timer = setInterval(function () { progress.update(); }, 5000);
		log.mainTimer = setInterval(function () { log.update(); }, 30000);
		log.speedTimer = setInterval(function () { log.speed(); }, 15000);

	}
});
