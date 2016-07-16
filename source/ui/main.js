"use strict"; // jshint unused:false

define([
	'consts', 'distance', 'lib', 'log', 'math', 'toggles', 'waypoints',
	'nav/LNAV', 'nav/progress', 'nav/VNAV', 'redefine'
], function (consts, distance, lib, log, math, toggles, waypoints, lnav, progress, vnav) {

	/* ---- UI actions binding ---- */

	// Modal actions: open/close
	var modal = document.getElementsByClassName('fmc-modal')[0];
	$(modal).on('click', '.close', function () {
		modal.close();
	}).parent().find('.gefs-ui-bottom').on('click', '.fmc-btn', function () {
		if (!modal.open) modal.showModal();
		else modal.close();
	});

	// Modal tab contents: toggle
	$('.fmc-modal__tab-bar').on('click', 'a', function (event) {
		event.preventDefault();
		var c = 'is-active',
			_this = $(this),
			_that = $('.fmc-modal__tab-bar .' + c);

		$(_that.attr('panel')).removeClass(c);
		$(_this.attr('panel')).addClass(c);
		_that.removeClass(c);
		_this.addClass(c);
	});
	// ----

	// Waypoint list actions: add/remove/move up or down
	// FIXME potential item index confusion/mess up
	$('.fmc-wpt-add-container').on('click', 'button[action="add-wpt"]', function () {
		waypoints.addWaypoint();
		componentHandler.upgradeDom();
	}).prev().on('click', 'button[action="remove-wpt"]', function () {
		var index = $(this).parents().eq(1).index() - 1;
		waypoints.removeWaypoint(index);
	}).on('click', 'button[action="move-wpt-up"]', function () {
		var row = $(this).parents().eq(1);
		waypoints.shiftWaypoint(row, row.index() - 1, 'up');
	}).on('click', 'button[action="move-wpt-down"]', function () {
		var row = $(this).parents().eq(1);
		waypoints.shiftWaypoint(row, row.index() - 1, 'down');
	});

	// Waypoint list input actions: update `route` array
	$('.fmc-wpt-list-container').on('change', 'input.wpt', function () {
		var wpt = $(this).val();
		var coords = waypoints.getCoords(wpt);
		var index = $(this).parents().eq(2).index() - 1;
		if (!coords) {
			waypoints.route[index][0] = wpt;
			waypoints.route[index][4] = false;
		} else {
			$(this).parents().eq(2).find('.lat').val(coords[0]);
			$(this).parents().eq(2).find('.lon').val(coords[0]);
			waypoints.route[index] = [wpt, coords[0], coords[1], undefined, true];
		}
	}).on('change', 'input.lat', function () {
		var index = $(this).parents().eq(2).index() - 1;
		waypoints.route[index][1] = waypoints.formatCoords($(this).val());
		waypoints.route[index][4] = false;
	}).on('change', 'input.lon', function () {
		var index = $(this).parents().eq(2).index() - 1;
		waypoints.route[index][2] = waypoints.formatCoords($(this).val());
		waypoints.route[index][4] = false;
	}).on('change', 'input.alt', function () {
		var index = $(this).parents().eq(2).index() - 1;
		waypoints.route[index][3] = Number($(this).val());
	});

	/* ---- All Initializations ---- */

	// Initializes all timers
	// FIXME It is annoying when debugging
	/*lnav.timer = setInterval(function () {
		lnav.update();
	}, 5000);

	progress.timer = setInterval(function () {
		progress.update();
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

	// Adds one input field on start
	waypoints.addWaypoint();

	// Stops key event propagation
	function stopPropagation (event) {
		event.stopImmediatePropagation();
	}

	$('.fmc-modal')
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
