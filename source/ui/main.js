"use strict"; // jshint unused:false

define(['consts', 'distance', 'lib', 'log', 'math', 'toggles', 'waypoints', 'nav/LNAV', 'nav/progress', 'nav/VNAV', 'redefine'],
function (consts, distance, lib, log, math, toggles, waypoints, lnav, progress, vnav) {

	/* ---- UI actions binding ---- */

	// Modal actions: open/close
	var modal = document.getElementsByClassName('fmc-modal')[0];
	$(modal).on('click', '.close', function () {
		modal.close();
	}).parent().on('click', '.fmc-btn', function () {
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

	// Add waypoint list
	$('button[action="add-wpt"]').click(function () {
		waypoints.addWaypoint();
		componentHandler.upgradeDom();
	});
	/* ---- All Initializations ---- */

	// Initializes all timers
	// FIXME It is annoying when debugging
	/*lnav.timer = setInterval(lnav.update, 5000);
	progress.timer = setInterval(progress.update, 5000);
	log.mainTimer = setInterval(log.update, 120000);
	log.gearTimer = setInterval(log.gear, 12000);
	log.flapsTimer = setInterval(log.flaps, 5000);
	log.speedTimer = setInterval(log.speed, 15000);*/

	// Adds one input field on start
	waypoints.addWaypoint();

	window.fmc = {
		version: "",
		requirejs: requirejs,
		require: require,
		define: define
	};
});
