"use strict";

define(['knockout', 'debug', 'flight', 'log', 'waypoints', 'nav/LNAV'], function (ko, debug, flight, log, waypoints, lnav) {

    // Autopilot++ Dependencies
    var	icao = autopilot_pp.require('json!data/icaoairports.json');

    /**
     * ViewModel function for knockout bindings
     */
    function ViewModel () {

        // RTE tab
        this.departureAirport = ko.pureComputed({
            read: function () {},
            write: function (airport) {
                var coords = icao[airport];

                if (!coords) flight.departure = [];
                else flight.departure = [
                    airport,
                    coords[0],
                    coords[1]
                ];

                lnav.update();
            }
        });

        this.arrivalAirport = ko.pureComputed({
            read: function () {},
            write: function (airport) {
                var coords = icao[airport];

                if (!coords) flight.arrival = [];
                else flight.arrival = [
                    airport,
                    coords[0],
                    coords[1]
                ];

                lnav.update();
            }
        });

        this.flightNumber = flight.number;
        this.route = waypoints.route;
        this.saveWaypoints = waypoints.saveData;
        this.retrieveWaypoints = waypoints.loadFromSave;
        this.addWaypoint = waypoints.addWaypoint;

        // ARR tab
        this.fieldElev = flight.fieldElev;
        this.todDist = flight.todDist;
        this.todCalc = flight.todCalc;

        // VNAV tab
        this.vnavEnabled = flight.vnavEnabled;
        this.cruiseAlt = flight.cruiseAlt;
        this.spdControl = flight.spdControl;
        this.phase = flight.phase;
        this.phaseLocked = flight.phaseLocked;

        var phaseToText = ['climb', 'cruise', 'descent'];
        this.currentPhaseText = ko.pureComputed(function () {
            return phaseToText[flight.phase()];
        });

        this.nextPhase = function () {
            var phase = flight.phase();

            flight.phase(phase === phaseToText.length - 1 ? 0 : phase + 1);
        };

        // Log tab
        this.removeLogData = log.removeData;

    }


    // Adds custom binding handler to fix MDL Inputs
    // FIXME
    ko.bindingHandlers.mdlInput = { update: debug.mdlInput };
    ko.bindingHandlers.mdlSwitch = { update: debug.mdlSwitch };

    return ViewModel;
});
