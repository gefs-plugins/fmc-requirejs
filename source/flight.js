"use strict";

define([
	'knockout', 'get', 'nav/LNAV', 'nav/VNAV', 'exports'
], function (ko, get, lnav, vnav, exports) {

	// Autopilot++ Dependencies
	var icao = autopilot_pp.require('json!data/icaoairports.json');

	// Top Of Descent distance
	var todDist = ko.observable();

	// If VNAV is enabled
	var _vnavEnabled = ko.observable(false);
	var vnavEnabled = ko.pureComputed({
		read: _vnavEnabled,
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
		var depArpt = departure.airport();
		var depSID = departure.SID() ? departure.SID().name : undefined;

		return get.runway(depArpt, depSID, true);
	});
	var _SIDs = ko.pureComputed(function () {
		var depArpt = departure.airport();
		var depRwy = departure.runway() ? departure.runway().runway : undefined;
		var depSID = departure.SID() ? departure.SID().name : undefined;

		return get.SID(depArpt, depRwy, depSID);
	});

	var departure = {
		// Departure airport name
		airport: ko.pureComputed({
			read: _departureAirport,
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
			read: _selectedDepartureRwy,
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
			read: _selectedSID,
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
			read: _arrivalAirport,
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
			read: _selectedArrivalRwy,
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
			read: _selectedSTAR,
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
		read: _cruiseAlt,
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
		read: _phase,
		write: function (index) {
			if (phaseLocked() || index > 3) return;
			_phase(index);
		},
	});

	var _phaseLocked = ko.observable(false);
	var phaseLocked = ko.pureComputed({
		read: _phaseLocked,
		write: function (boolean, viewmodel) { // jshint unused:false
			_phaseLocked(boolean);
		}
	});

	// Automatic TOD calculation
	var todCalc = ko.observable(false);

	// Arrival Airport field altitude
	var fieldElev = ko.observable();

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

});
