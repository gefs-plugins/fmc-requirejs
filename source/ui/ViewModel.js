"use strict";

define(['knockout', 'debug', 'flight', 'log', 'waypoints', 'nav/progress'], function (ko, debug, flight, log, waypoints, progress) {

    /**
     * ViewModel function for knockout bindings
     */
    function ViewModel () {
        var self = this;

         // General modal actions
        var _opened = ko.observable(false);
        self.opened = ko.pureComputed({
            read: function () {
                return _opened();
            },
            write: function (boolean, viewmodel) { // jshint unused:false
                _opened(boolean);
            }
        });

        self.modalWarning = ko.observable();
        log.warn = ko.pureComputed({ // Prints modal warning, disappears after 5 seconds
    		read: function () {
    			return self.modalWarning();
    		},
    		write: function (warningText) {
    			self.modalWarning(warningText);
    			setTimeout(function () { self.modalWarning(undefined); }, 5000);
    		}
    	});

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

        // PROG tab
        self.progInfo = progress.info;

        // LOAD tab
        self.loadRouteText = ko.observable();
        self.loadRoute = function () {
            waypoints.toRoute(self.loadRouteText());
            self.loadRouteText(undefined);
        };

        var generatedRouteText = ko.observable();
        self.generateRoute = ko.pureComputed({
            read: function () {
                return generatedRouteText();
            },
            write: function (isGenerate, viewmodel) { // jshint unused:false
                var generatedRoute = isGenerate ? waypoints.toRouteString() : undefined;
                generatedRouteText(generatedRoute);
            }
        });

        // LOG tab
        self.logData = log.data;
        self.removeLogData = log.removeData;

    }

    return ViewModel;
});
