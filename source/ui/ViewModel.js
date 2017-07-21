"use strict";

define(['knockout', 'debug', 'flight', 'log', 'waypoints', 'nav/LNAV'], function (ko, debug, flight, log, waypoints, lnav) {

    // Autopilot++ Dependencies
    var	icao = autopilot_pp.require('json!data/icaoairports.json');

    /**
     * ViewModel function for knockout bindings
     */
    function ViewModel () {
        var self = this;

        // RTE tab
        self.departureAirport = flight.departure.airport;
        self.arrivalAirport = flight.arrival.airport;
        self.flightNumber = flight.number;
        self.route = waypoints.route;
        self.nextWaypoint = waypoints.nextWaypoint;
        self.saveWaypoints = waypoints.saveData;
        self.retrieveWaypoints = waypoints.loadFromSave;
        self.addWaypoint = waypoints.addWaypoint;
        self.activateWaypoint = waypoints.activateWaypoint;
        self.shiftWaypoint = waypoints.shiftWaypoint;
        self.removeWaypoint = waypoints.removeWaypoint;

        // ARR tab
        self.fieldElev = flight.fieldElev;
        self.todDist = flight.todDist;
        self.todCalc = flight.todCalc;

        // VNAV tab
        self.vnavEnabled = flight.vnavEnabled;
        self.cruiseAlt = flight.cruiseAlt;
        self.spdControl = flight.spdControl;
        self.phase = flight.phase;
        self.phaseLocked = flight.phaseLocked;

        var phaseToText = ['climb', 'cruise', 'descent'];
        self.currentPhaseText = ko.pureComputed(function () {
            return phaseToText[flight.phase()];
        });

        self.nextPhase = function () {
            var phase = flight.phase();

            flight.phase(phase === phaseToText.length - 1 ? 0 : phase + 1);
        };

        // Log tab
        self.removeLogData = log.removeData;

    }


    // Adds custom binding handler to fix MDL Inputs
    // FIXME
    ko.bindingHandlers.mdlInput = { update: debug.mdlInput };
    ko.bindingHandlers.mdlSwitch = { update: debug.mdlSwitch };

    return ViewModel;
});
