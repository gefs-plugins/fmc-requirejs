"use strict";

define(['knockout', 'debug', 'flight', 'get', 'log', 'waypoints', 'nav/progress'], function (ko, debug, flight, get, log, waypoints, progress) {

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
        self.departureAirport = ko.pureComputed({
            read: function () {
                return flight.departure.airport();
            },
            write: function (airport) {
                flight.departure.airport(airport);

                self.departureRwy();
                self.STAR();
            }
        });

        self.arrivalAirport = ko.pureComputed({
            read: function () {
                return flight.arrival.airport();
            },
            write: function (airport) {
                flight.arrival.airport(airport);

                self.SID();
                self.arrivalRwy();
            }
        });

        self.flightNumber = flight.number;
        self.route = waypoints.route;
        self.nextWaypoint = waypoints.nextWaypoint;
        self.saveWaypoints = waypoints.saveData;
        self.retrieveWaypoints = waypoints.loadFromSave;
        self.addWaypoint = waypoints.addWaypoint;
        self.activateWaypoint = waypoints.activateWaypoint;
        self.shiftWaypoint = waypoints.shiftWaypoint;
        self.removeWaypoint = waypoints.removeWaypoint;

        // DEP/ARR tab
        self.fieldElev = flight.fieldElev;
        self.todDist = flight.todDist;
        self.todCalc = flight.todCalc;

        self.departureRwy = ko.pureComputed(function () {
            return get.runway(flight.departure.airport);
        });

        self.SID = ko.pureComputed(function () {
            return get.SID(flight.departure.airport);
        });

        self.STAR = ko.pureComputed(function () {
            return get.STAR(flight.arrival.airport);
        });

        self.arrivalRwy = ko.pureComputed(function () {
            return get.runway(flight.arrival.airport);
        });

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
