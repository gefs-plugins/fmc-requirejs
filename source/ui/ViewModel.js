"use strict";

define(['knockout', 'debug', 'flight', 'get', 'log', 'waypoints', 'nav/LNAV', 'nav/progress'], function (ko, debug, flight, get, log, waypoints, lnav, progress) {

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

        self.arrivalAirport = ko.pureComputed({
            read: function () {
                return flight.arrival.airport();
            },
            write: function (airport) {
                flight.arrival.airport(airport);
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
            return self.departureRunway().runway;
        });

        // List of SIDs based on departure airport and runway
        self.SIDList = ko.pureComputed(function () {
            return get.SID(self.departureAirport(), self.departureRwyName());
        });

        // Selected SID name
        self.SID = flight.departure.SID;
        self.SIDName = ko.pureComputed(function () {
            return self.SID().name;
        });

        // List of arrival runways based on arrival airport
        self.arrivalRwys = ko.pureComputed(function () {
            return get.runway(flight.arrival.airport());
        });

        // Selected arrival runway
        var _selectedArrivalRwy = ko.observable();
        self.selectedArrivalRwy = ko.pureComputed({
            read: function () {
                return _selectedArrivalRwy();
            },
            write: function (index) {
                var rwyData = self.arrivalRwys()[index];

                // Sets selected arrival runway and data to 'flight'
                flight.arrival.runway = ko.pureComputed(function () {
                    return rwyData;
                });

                _selectedArrivalRwy(rwyData ? rwyData.runway : undefined);
            }
        });

        // List of STARs based on arrival airport and runway
        // FIXME: STARs do not necessarily need a runway at first
        self.STARs = ko.pureComputed(function () {
            return get.STAR(flight.arrival.airport(), self.selectedArrivalRwy());
        });

        // Selected STAR
        var _selectedSTAR = ko.observable();
        self.selectedSTAR = ko.pureComputed({
            read: function () {
                return _selectedSTAR();
            },
            write: function (index) {
                var STAR = self.STARs()[index];

                // Sets selected STAR and data to 'flight'
                flight.arrival.STAR = ko.pureComputed(function () {
                    return STAR;
                });

                _selectedSTAR(STAR ? STAR.name : undefined);
            }
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
