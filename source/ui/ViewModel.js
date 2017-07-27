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
        self.departureAirport = ko.pureComputed({
            read: function () {
                return flight.departure.airport();
            },
            write: function (airport) {
                flight.departure.airport(airport);

                self.departureRwys();
            }
        });

        self.arrivalAirport = ko.pureComputed({
            read: function () {
                return flight.arrival.airport();
            },
            write: function (airport) {
                flight.arrival.airport(airport);

                self.arrivalRwys();
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
        self.departureRwys = ko.pureComputed(function () {
            return get.runway(flight.departure.airport());
        });

        // Selected departure runway
        var _selectedDepartureRwy = ko.observable();
        self.selectedDepartureRwy = ko.pureComputed({
            read: function () {
                return _selectedDepartureRwy();
            },
            write: function (index) {
                var rwyData = self.departureRwys()[index];

                // Sets selected departure runway and data to 'flight'
                flight.departure.runway = ko.pureComputed(function () {
                    return rwyData;
                });

                _selectedDepartureRwy(rwyData ? rwyData.runway : undefined);
                self.SIDs();
            }
        });

        // List of SIDs based on departure airport and runway
        self.SIDs = ko.pureComputed(function () {
            return get.SID(flight.departure.airport(), self.selectedDepartureRwy());
        });

        // Selected SID
        var _selectedSID = ko.observable();
        self.selectedSID = ko.pureComputed({
            read: function () {
                return _selectedSID();
            },
            write: function (index) {
                var SID = self.SIDs()[index];

                // Sets selected SID and data to 'flight'
                flight.departure.SID = ko.pureComputed(function () {
                    return SID;
                });

                _selectedSID(SID ? SID.name : undefined);
            }
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
                self.STARs();
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
