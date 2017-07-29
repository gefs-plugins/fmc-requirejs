"use strict";

define([
	'knockout', 'get', 'nav/LNAV', 'nav/VNAV', 'vnav-profile', 'exports'
], function (ko, get, lnav, vnav, vnavProfile, exports) {

	// Autopilot++ Dependencies
	var apModes = autopilot_pp.require('autopilot').modes,
		icao = autopilot_pp.require('json!data/icaoairports.json');

	// Top Of Descent distance
	var todDist = ko.observable();

	// If VNAV is enabled
	var _vnavEnabled = ko.observable(false);
	var vnavEnabled = ko.pureComputed({
		read: function () {
			return _vnavEnabled();
		},
		write: function (boolean) {
			var set = _vnavEnabled;

			if (!cruiseAlt()) set(false);

			else if (boolean) {
				vnav.timer = setInterval(function () { vnav.update(); }, 5000);
				set(true);
			} else {
				clearInterval(vnav.timer);
				vnav.timer = null;
				set(false);
			}
		}
	});

	// Speed control
	var spdControl = ko.observable(true);

	/**
	 * departure object: airport, coords, runway, and SID
	 */
	var _departureAirport = ko.observable();
	var _departureCoords = ko.observable([]);
	var _selectedDepartureRwy = ko.observable();
	var _selectedSID = ko.observable();

	// List of runways and SIDs
	var _departureRwys = ko.pureComputed(function () {
		return get.runway(departure.airport());
	});
	var _SIDs = ko.pureComputed(function () {
		return get.SID(departure.airport(), departure.runway() ? departure.runway().runway : false);
	});

	var departure = {
		// Departure airport name
		airport: ko.pureComputed({
			read: function () {
				return _departureAirport();
			},
			write: function (airport) {
				var oldAirport = _departureAirport();
				var coords = icao[airport];

				if (airport !== oldAirport) departure.runway(undefined);

				if (!coords) {
					_departureAirport(undefined);
					_departureCoords([]);
				}
				else {
					_departureAirport(airport);
					_departureCoords(coords);
				}

				lnav.update();
			}
		}),

		// Departure airport coordinates
		coords: ko.pureComputed(function () {
			return _departureCoords();
		}),

		// Departure runway data
		runway: ko.pureComputed({
			read: function () {
				return _selectedDepartureRwy();
			},
			write: function (index) {
				var rwyData = _departureRwys()[index];

				if (rwyData) _selectedDepartureRwy(rwyData);
				else {
					_selectedDepartureRwy(undefined);
					departure.SID(undefined);
				}
			}
		}),

		// SID data
		SID: ko.pureComputed({
			read: function () {
				return _selectedSID();
			},
			write: function (index) {
				var SIDData = _SIDs()[index];
				_selectedSID(SIDData);
			}
		})

	};

	/**
	 * arrival object: airport, coords, runway, and SID
	 */
	var _arrivalAirport = ko.observable();
	var _arrivalCoords = ko.observable([]);
	var _selectedArrivalRwy = ko.observable();
	var _selectedSTAR = ko.observable();

	// List of runways and STARs
	var _arrivalRwys = ko.pureComputed(function () {
		return get.runway(arrival.airport());
	});
	var _STARs = ko.pureComputed(function () {
		return get.SID(arrival.airport(), arrival.runway() ? arrival.runway().runway : false);
	});

	var arrival = {
		// Arrival airport name
		airport: ko.pureComputed({
			read: function () {
				return _arrivalAirport();
			},
			write: function (airport) {
				var oldAirport = _arrivalAirport();
				var coords = icao[airport];

				if (airport !== oldAirport) arrival.runway(undefined);

				if (!coords) {
					_arrivalAirport(undefined);
					_arrivalCoords([]);
				}
				else {
					_arrivalAirport(airport);
					_arrivalCoords(coords);
				}
				lnav.update();
			}
		}),

		// Arrival airport coordinates
		coords: ko.pureComputed(function () {
			return _arrivalCoords();
		}),

		// Arrival runway data
		runway: ko.pureComputed({
			read: function () {
				return _selectedArrivalRwy();
			},
			write: function (index) {
				var rwyData = _arrivalRwys()[index];

				if (rwyData) _selectedArrivalRwy(rwyData);
				else {
					_selectedArrivalRwy(undefined);
					arrival.STAR(undefined);
				}
			}
		}),

		// STAR data
		STAR: ko.pureComputed({
			read: function () {
				return _selectedSTAR();
			},
			write: function (index) {
				var STARData = _STARs()[index];
				_selectedSTAR(STARData);
			}
		})

	};

	// Flight Number
	var flightNumber = ko.observable();

	// Cruise altitude
	var _cruiseAlt = ko.observable();
	var cruiseAlt = ko.pureComputed({
		read: function () {
			return _cruiseAlt();
		},
		write: function (val) {
			var set = _cruiseAlt;

			if (!val) {
				set(undefined);
				vnavEnabled(false);
			} else set(+val);
		}
	});

	// Flight phase
	var _phase = ko.observable(0);
	var phase = ko.pureComputed({
		read: function () {
			return _phase();
		},
		write: function (index) {
			if (phaseLocked() || index > 3) return;
			_phase(index);
		},
	});

	var _phaseLocked = ko.observable(false);
	var phaseLocked = ko.pureComputed({
		read: function () {
			return _phaseLocked();
		},
		write: function (boolean, viewmodel) { // jshint unused:false
			_phaseLocked(boolean);
		}
	});

	// Automatic TOD calculation
	var todCalc = ko.observable(false);

	// Arrival Airport field altitude
	var fieldElev = ko.observable();

	/**
	 * Gets each plane's flight parameters, for VNAV
	 *
	 * @returns {Array} [speed, vertical speed]
	 */
	function getFlightParameters () {
		var spd, vs;
		var a = geofs.aircraft.instance.animationValue.altitude;

		// Defaults to KIAS mode
		apModes.speed.isMach(false);

		// CLIMB
		if (phase() === 0) {
			var profile = getVNAVProfile().climb;

			for (var i = 0, index = 0; i < profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}

			spd = profile[index][2];
			vs = profile[index][3];

			switchIfMach(spd);
		}

		// DESCENT
		else if (phase() === 2) {
			var profile = getVNAVProfile().descent;

			for (var i = 0, index = 0; i < profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}

			spd = profile[index][2];
			vs = profile[index][3];

			switchIfMach(spd);
		}

		return [spd, vs];
	}

	/**
	 * @private
	 * Gets the climb/descent profile for VNAV
	 *
	 * @returns {Object} The profile needed by VNAV
	 */
	function getVNAVProfile () {
		return geofs.aircraft.instance.setup.fmc
			|| vnavProfile[geofs.aircraft.instance.id]
			|| vnavProfile.DEFAULT;
	}

	/**
	 * @private
	 * Checks if the speed input is mach and switches mode
	 *
	 * @param {Number} spd The speed to be checked
	 */
	function switchIfMach (spd) {
		if (spd <= 10) apModes.speed.isMach(true);
	}


	// Variables
	exports.todDist = todDist;
	exports.vnavEnabled = vnavEnabled;
	exports.spdControl = spdControl;
	exports.departure = departure;
	exports.arrival = arrival;
	exports.number = flightNumber;
	exports.cruiseAlt = cruiseAlt;
	exports.phase = phase;
	exports.phaseLocked = phaseLocked;
	exports.todCalc = todCalc;
	exports.fieldElev = fieldElev;

	// Functions
	exports.parameters = getFlightParameters;

});
