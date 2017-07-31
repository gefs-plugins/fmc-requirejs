"use strict";

define(['knockout', 'flight', 'get', 'log', 'waypoints', 'nav/progress'], function (ko, flight, get, log, waypoints, progress) {

    /**
     * ViewModel function for knockout bindings
     */
    function ViewModel () {
        var self = this;

        /*************************
         * General Modal Actions *
         *************************/
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

        /***********
         * RTE Tab *
         ***********/
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

        /***************
         * DEP/ARR Tab *
         ***************/
        self.fieldElev = flight.fieldElev;
        self.todDist = flight.todDist;
        self.todCalc = flight.todCalc;

        // List of departure runways based on departure airport
        self.departureRwyList = ko.pureComputed(function () {
            return get.runway(self.departureAirport());
        });

        // Selected departure runway and name
        self.departureRunway = flight.departure.runway;
        self.departureRwyName = ko.pureComputed(function () {
            if (self.departureRunway()) return self.departureRunway().runway;
            else return undefined;
        });

        // List of SIDs based on departure airport and runway
        self.SIDList = ko.pureComputed(function () {
            return get.SID(self.departureAirport(), self.departureRwyName());
        });

        // Selected SID name
        self.SID = flight.departure.SID;
        self.SIDName = ko.pureComputed(function () {
            if (self.SID()) return self.SID().name;
            else return undefined;
        });

        // List of arrival runways based on arrival airport
        self.arrivalRwyList = ko.pureComputed(function () {
            return get.runway(self.arrivalAirport());
        });

        // Selected arrival runway and name
        self.arrivalRunway = flight.arrival.runway;
        self.arrivalRunwayName = ko.pureComputed(function () {
            if (self.arrivalRunway()) return self.arrivalRunway().runway;
            else return undefined;
        });

        // List of STARs based on arrival airport and runway
        // FIXME: STARs do not necessarily need a runway at first
        self.STARs = ko.pureComputed(function () {
            return get.STAR(self.arrivalAirport(), self.arrivalRunwayName());
        });

        // Selected STAR name
        self.STAR = flight.arrival.STAR;
        self.STARName = ko.pureComputed(function () {
            if (self.STAR()) return self.STAR().name;
            else return undefined;
        });

        /************
         * VNAV Tab *
         ************/
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

        /************
         * PROG Tab *
         ************/
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

        /***********
         * LOG Tab *
         ***********/
        self.logData = log.data;
        self.removeLogData = log.removeData;

    }

    return ViewModel;
});
