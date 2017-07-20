"use strict";

define(['knockout', 'debug', 'flight', 'log', 'waypoints', 'nav/VNAV'], function (ko, debug, flight, log, waypoints, vnav) {
    /**
     * ViewModel function for knockout bindings
     */
    function ViewModel () {

        // RTE tab
        this.arrival = ko.pureComputed({
            read: function () {
                return flight.arrival;
            },
            write: function (airport) {
                var coords = waypoints.getCoords(airport);

                if (!coords) flight.arrival([]);
                else flight.arrival([airport, coords[0], coords[1]]);
            }
        });

        // ARR tab
        this.fieldElev = flight.fieldElev;
        this.todDist = flight.todDist;
        this.todCalc = flight.todCalc;

        // VNAV tab
        this.vnavEnabled = ko.pureComputed({
            read: function () {
                return flight.vnavEnabled();
            },
            write: function (boolean) {
                var set = flight.vnavEnabled;

                if (!flight.cruiseAlt()) set(false);

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

        this.cruiseAlt = ko.pureComputed({
            read: function () {
                return flight.cruiseAlt();
            },
            write: function (val) {
                var set = flight.cruiseAlt;

                if (!val) {
                    set(undefined);
                    flight.vnavEnabled(false);
                } else set(val);
            }
        });

        this.spdControl = flight.spdControl;

        var phaseToText = ['climb', 'cruise', 'descent'];
        var phaseLocked = ko.observable(false);

        this.locked = ko.pureComputed({
            read: function () {
                return phaseLocked();
            },
            write: function (boolean) {
                phaseLocked(boolean);
            }
        });

        this.phase = ko.pureComputed({
            read: function () {
                return flight.phase();
            },
            write: function (index) {
                if (phaseLocked()) return;
                flight.phase(index);
            }
        });

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
    // ko.bindingHandlers.mdlInput = { update: debug.mdlInput };
    ko.bindingHandlers.mdlSwitch = { update: debug.mdlSwitch };

    return ViewModel;
});
