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
		var vm = window.debugVM = new ViewModel();
		ko.applyBindings(vm, $(modal)[0]);
		ko.applyBindings(vm, $(btn.fmcBtn)[1]);

		// Adds one input field on start
		waypoints.addWaypoint();

		/* ---- UI actions binding ---- */

		// -----------------------------------------
		// ------------- General Modal -------------
		// -----------------------------------------

		// Modal actions: close on button click
		$(modal).keydown(function (event) { // Sets escape button to close FMC
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
		/*
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
		});*/

		// Disables editing on the generated route textarea
		$(textarea.generateRte).prop('disabled', true);




		/* ---- All Initializations ---- */

		// Initializes all timers
		//progress.timer = setInterval(function () { progress.update(); }, 5000);
		log.mainTimer = setInterval(function () { log.update(); }, 30000);
		log.speedTimer = setInterval(function () { log.speed(); }, 15000);

	}
});
