"use strict"; // jshint unused:false

define([
	'bugfix', 'consts', 'distance', 'flight', 'log', 'map', 'math', 'waypoints',
	'nav/LNAV', 'nav/progress', 'nav/VNAV', './elements', 'redefine', './position'
], function (bugfix, consts, distance, flight, log, map, math, waypoints, lnav, progress, vnav, E) {

	// Checks if UI has been properly placed
	var timer = setInterval(function () {
		if ($(E.modal)[0] && $(E.btn.fmcBtn)) {
			clearInterval(timer);
			loadFMC();
		}
	}, 4);

	// FMC actions init function
	function loadFMC () {
		var modal = document.querySelector(E.modal),
			container = E.container,
			btn = E.btn,
			input = E.input;

		// Adds one input field on start
		waypoints.addWaypoint();

		/* ---- UI actions binding ---- */

		// -----------------------------------------
		// ------------- General Modal -------------
		// -----------------------------------------

		// Modal actions: open/close
		$(modal).on('click', btn.close, function () {
			modal.close();
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

		// -----------------------------------------
		// ---------------- ARR TAB ----------------
		// -----------------------------------------

		// TOD Distance and Field Elevation inputs
		$(container.arrPage).on('change', input.todDist, function () {
			flight.tod = Number($(this).val());
		}).on('change', input.fieldElev, function () {
			flight.fieldElev = Number($(this).val());
		});

		// Automatic TOD calculation button
		$(container.autoTOD).on('click', btn.autoTOD, function () {
			if ($(this).parent().hasClass('is-checked'))
				flight.todCalc = false;
			else flight.todCalc = true;

			// Instantly updates VNAV info
			vnav.update();
		});

		// ----------------------------------------
		// --------------- VNAV TAB ---------------
		// ----------------------------------------

		// VNAV, Speed toggle and cruising altitude input
		$(btn.vnavToggle).prop('disabled', true).parent().addClass('is-disabled');

		$(container.vnavPage).on('click', btn.vnavToggle, function () {
			if (flight.cruiseAlt) {
				if ($(this).parent().hasClass('is-checked')) {
					flight.VNAV = false;
					clearInterval(vnav.timer);
				} else {
					flight.VNAV = true;
					// vnav.timer = setInterval(vnav.update, 5000);
				}
			}
		}).on('click', btn.spdToggle, function () {
			if ($(this).parent().hasClass('is-checked'))
				flight.spdControl = false;
			else flight.spdControl = true;
		}).on('change', input.cruiseAlt, function () {
			// If cruise altitude is an error or is empty (0)
			if ($(this).parent().hasClass('is-invalid') || Number($(this).val().trim()) === 0) {
				// Disables VNAV toggle button
				flight.cruiseAlt = undefined;
				$(btn.vnavToggle).prop('disabled', true)
					.parent().removeClass('is-checked').addClass('is-disabled');
				flight.VNAV = false;
				return;
			}

			// Sets cruise alt and enables vnav toggle button
			flight.cruiseAlt = Number($(this).val().trim());
			$(btn.vnavToggle).prop('disabled', false).parent().removeClass('is-disabled');
		});

		// VNAV phase
		$(container.vnavPhase).on('click', btn.togglePhase, function () {
			// TODO implement function
		}).on('click', btn.lockPhase, function () {
			if ($(this).hasClass('locked')) $(this).removeClass('locked');
			else $(this).addClass('locked');
		});

		// ----------------------------------------
		// --------------- PROG TAB ---------------
		// ----------------------------------------

		// ----------------------------------------
		// --------------- LOAD TAB ---------------
		// ----------------------------------------

		// Loads waypoints separated by spaces or generated route
		$(container.loadPage).on('click', btn.loadWpt, function () {
			waypoints.toRoute($(input.loadWpt).val().trim());
		});

		// Disables editing on the generated route textarea
		$(E.textarea).prop('disabled', true);

		// Generates an FMC route to the textarea
		$(modal).on('click', btn.generateRte, function () {
			bugfix.input($(E.textarea).val(waypoints.toRouteString()).change());
		}).on('click', btn.clearRte, function () {
			$(E.textarea).val('').change().parent().removeClass('is-dirty');
		});

		// -----------------------------------------
		// ---------------- LOG TAB ----------------
		// -----------------------------------------

		$(modal).on('click', btn.removeLogData, function () {
			log.removeData();
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

	}
});
