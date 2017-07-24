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
		ko.applyBindings(vm, $('.fmc-prog-info.geofs-f-standard-ui')[0]);

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

		// Disables editing on the generated route textarea
		$(textarea.generateRte).prop('disabled', true);




		/* ---- All Initializations ---- */

		// Initializes all timers
		//progress.timer = setInterval(function () { progress.update(); }, 5000);
		log.mainTimer = setInterval(function () { log.update(); }, 30000);
		log.speedTimer = setInterval(function () { log.speed(); }, 15000);

	}
});
