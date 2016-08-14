"use strict"; // jshint unused:false

define([
	'consts', 'distance', 'flight', 'log', 'map', 'math', 'toggles',
	'waypoints', 'nav/LNAV', 'nav/progress', 'nav/VNAV', './elements', 'redefine'
], function (consts, distance, flight, log, map, math, toggles, waypoints, lnav, progress, vnav, E) {

	var modal = document.querySelector(E.modal),
		container = E.container,
		btn = E.btn,
		input = E.input;

	// Inits Map
	map.container = document.querySelector(container.map);
	map.map = new google.maps.Map(map.container, map.options);

	// Adds one input field on start
	waypoints.addWaypoint();

	/* ---- UI actions binding ---- */


	// Modal actions: open/close, save data
	$(modal).on('click', btn.close, function () {
		modal.close();
	}).on('click', btn.saveWptData, function () {
		waypoints.saveData();
	}).on('click', btn.retrieveWpt, function () {
		waypoints.loadFromSave();
	}).on('click', btn.removeLogData, function () {
		log.removeData();
	}).parent().on('click', btn.fmcBtn, function () {
		if (!modal.open) modal.showModal();
		else modal.close();
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
	// ----

	// Waypoint list actions: activate/add/remove/move up or down
	// FIXME potential item index confusion/mess up
	$(container.addWpt).on('click', btn.addWpt, function () {
		waypoints.addWaypoint();
	}).prev().on('click', btn.activateWpt, function () {
		var index = $(this).parents().eq(1).index() - 1;
		waypoints.activateWaypoint(index);
	}).on('click', btn.removeWpt, function () {
		var index = $(this).parents().eq(1).index() - 1;
		waypoints.removeWaypoint(index);
	}).on('click', btn.moveWptUp, function () {
		var row = $(this).parents().eq(1);
		waypoints.shiftWaypoint(row, row.index() - 1, 'up');
	}).on('click', btn.moveWptDown, function () {
		var row = $(this).parents().eq(1);
		waypoints.shiftWaypoint(row, row.index() - 1, 'down');
	});

	// Arrival airport input
	$(container.depArr).on('change', input.arr, function () {
		var wpt = $(this).val().trim();
		if (wpt) {
			var coords = waypoints.getCoords(wpt);
			if (coords) flight.arrival = [wpt, coords[0], coords[1]];
			else flight.arrival = [];
		} else flight.arrival = [];
	});

	// Waypoint list input actions: update `route` array
	$(container.wptList).on('change', input.wpt, function () {
		if (!$(this).parent().hasClass('is-invalid')) {
			var wpt = $(this).val();
			var coords = waypoints.getCoords(wpt);
			var index = $(this).parents().eq(2).index() - 1;
			if (!coords) {
				waypoints.route[index][0] = wpt;
				waypoints.route[index][4] = false;
			} else {
				$(this).parents().eq(2).find(input.lat).val(coords[0]);
				$(this).parents().eq(2).find(input.lon).val(coords[0]);
				waypoints.route[index] = [wpt, coords[0], coords[1], undefined, true];
				progress.printNextWaypointInfo(index);
			}
		}
	}).on('change', input.lat, function () {
		if (!$(this).parent().hasClass('is-invalid')) {
			var index = $(this).parents().eq(2).index() - 1;
			if (!$(this).val() || $(this).val() === '') {
				waypoints.route[index][1] = undefined;
			} else {
				waypoints.route[index][1] = waypoints.formatCoords($(this).val());
			}
			waypoints.route[index][4] = false;
			if (waypoints.route[index][2]) progress.printNextWaypointInfo(index);
		}
	}).on('change', input.lon, function () {
		if (!$(this).parent().hasClass('is-invalid')) {
			var index = $(this).parents().eq(2).index() - 1;
			if (!$(this).val() || $(this).val() === '') {
				waypoints.route[index][2] = undefined;
			} else {
				waypoints.route[index][2] = waypoints.formatCoords($(this).val());
			}
			waypoints.route[index][4] = false;
			if (waypoints.route[index][1]) progress.printNextWaypointInfo(index);
		}
	}).on('change', input.alt, function () {
		if (!$(this).parent().hasClass('is-invalid')) {
			var index = $(this).parents().eq(2).index() - 1;
			waypoints.route[index][3] = Number($(this).val());
		}
	});

	/* ---- All Initializations ---- */

	// Initializes all timers
	// FIXME It is annoying when debugging
	/*lnav.timer = setInterval(function () {
		lnav.update();
	}, 5000);

	progress.timer = setInterval(function () {
		progress.update(waypoints);
	}, 5000);

	log.mainTimer = setInterval(function () {
		log.update();
	}, 120000);

	log.gearTimer = setInterval(function () {
		log.gear();
	}, 12000);

	log.flapsTimer = setInterval(function () {
		log.flaps();
	}, 5000);

	log.speedTimer = setInterval(function () {
		log.speed();
	}, 15000);*/

	// Stops key event propagation
	function stopPropagation (event) {
		event.stopImmediatePropagation();
	}

	$(modal).find('input')
		.keyup(stopPropagation)
		.keydown(stopPropagation)
		.keypress(stopPropagation);

	window.fmc = {
		version: "",
		requirejs: requirejs,
		require: require,
		define: define
	};
});
