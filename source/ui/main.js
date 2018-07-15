"use strict";

define([
	'knockout', './ViewModel', './position', 'debug', 'log',
	/*'polyline', */'waypoints', 'nav/progress', './elements', 'redefine'
], function (ko, ViewModel, positioningFMC, debug, log, /*polyline, */waypoints, progress, E) {

	// If UI is properly placed, load FMC
	positioningFMC.then(loadFMC);

	// FMC actions init function
	function loadFMC () {
		var modal = E.modal,
			container = E.container,
			btn = E.btn;

		// Applies knockout bindings
		var vm = new ViewModel();
		ko.applyBindings(vm, $(modal)[0]);
		ko.applyBindings(vm, $(btn.fmcBtn)[1]);
		ko.applyBindings(vm, $(container.uiBottomProgInfo)[0]);

		// Inits waypoint field
		// HACK: opens nav tab to make sure map imagery loads
		// new Promise(function (resolve) {
		// 	ui.panel.toggle('.geofs-map-list');
		// 	ui.createMap();
		// 	var timer = setInterval(function () {
		// 		if (!ui.map) return;
		// 		clearInterval(timer);
		// 		resolve();
		// 	}, 250);
		// }).then(function () {
			// polyline.path.addTo(ui.mapInstance);
			waypoints.addWaypoint();
		// });

		/* ---- UI actions binding ---- */

		// Modal actions: close on button click
		$(modal).keydown(function (event) { // Sets escape button to close FMC
			if ((event.which === 27 || event.keyCode === 27) && $(this).is(':visible'))
				$(modal).removeClass('opened');
		});

		// IDEA Move to knockout?
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

		/* ---- All Initializations ---- */

		// Initializes all timers
		progress.timer = setInterval(function () { progress.update(); }, 5000);
		log.mainTimer = setInterval(function () { log.update(); }, 30000);
		log.speedTimer = setInterval(function () { log.speed(); }, 15000);
	}

});
