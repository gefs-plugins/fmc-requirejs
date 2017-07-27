"use strict";

define(['flight', 'utils', 'exports'], function (flight, utils, exports) {

    // Glideslope, in degrees
    var glideslope = flight.arrival.runway()[3];

    // Threshold lat/lon
    var thresholdCoords = [ flight.arrival.runway()[0], flight.arrival.runway()[1] ];

    // Opposite end lat/lon
    // FIXME: find thresholdCoords of opposite runway
    // | Opposite runway # - Current runway # | = 18, L <-> R, C <-> C
    var oppositeCoords = [];

    // URLs of instruments
    var FILE_PATH = PAGE_PATH + 'fmc/images/';
    var url = {
        attitudeJetILS: FILE_PATH + 'attitude-jet-ils.png',
        glideslopeHand: FILE_PATH + 'glideslope-indicator.png',
        localizerHand: FILE_PATH + 'localizer-indicator.png'
    };

    /**
     * Calculates the deviation value of glideslope
     *
     * @returns {Number} The value of glideslope deviation
     */
    function glideslopeCalc () { // FIXME find the true value for "VALUE"
        var gs = glideslope;
        var threshold = exports.thresholdCoords;
        var current = geofs.aircraft.instance.llaLocation;

        // If either one component is missing, invalid, returns 0
        if (!(threshold[0] && threshold[1] && current[0] && current[1] && current[2])) return 0;

        var VALUE = 1; // Constant value to multiply ticks off by

        // Landing zone calculations and target altitude
        var altitudeAtAim = geofs.getGroundAltitude(threshold[0], threshold[1]); // Feet
        var distanceToAim = utils.getDistance(current[0], current[1], threshold[0], threshold[1]) + 500 * utils.FEET_TO_NM; // nm
        var targetAltitude = Math.tan(utils.toRadians(gs)) * distanceToAim * utils.NM_TO_FEET + altitudeAtAim; // Feet

        // Each tick stands for 1/4 degrees off the intended glideslope
        var quarterDegree = Math.tan(utils.toRadians(0.25)) * distanceToAim * utils.NM_TO_FEET;
        var ticksOff = (targetAltitude - current[2]) / quarterDegree;

        // Maximum of 2 ticks on each side
        if (Math.abs(ticksOff) <= 2) return ticksOff * VALUE;
        else if (ticksOff < 0) return -VALUE * 2;
        else return VALUE * 2;
    }

    /**
     * Calculates the deviation value of localizer
     *
     * @returns {Number} The value of localizer deviation
     */
    function localizerCalc () { // FIXME find the true value for "VALUE" and offset distance threshold
        var threshold = thresholdCoords;
        var opposite = oppositeCoords;
        var current = geofs.aircraft.instance.llaLocation;

        // If either one component is missing, invalid, returns 0
        if (!(threshold[0] && threshold[1] && opposite[0] && opposite[1] && current[0])) return 0;

        var VALUE = 1; // Constant to multiply ticks off by

        // Deviation from centerline calculation, achieved by using the sine of the angle in between
        var distanceToThreshold = utils.getDistance(current[0], current[1], threshold[0], threshold[1]);
        var runwayBearing = utils.getBearing(threshold[0], threshold[1], opposite[0], opposite[1]);
        var deltaTheta = utils.getBearing(current[0], current[1], threshold[0], threshold[1]) - runwayBearing;
        var offsetDistance = Math.sin(utils.toRadians(deltaTheta)) * distanceToThreshold * utils.NM_TO_FEET;

        // Each tick stands for 3 degrees off the centerline (300 feet at threshold)
        var maxOffsetDistance = Math.sin(utils.toRadians(3)) * (distanceToThreshold * utils.NM_TO_FEET + 500);
        var ticksOff = offsetDistance / (300 + maxOffsetDistance);

        // Maximum of 1 tick on each side
        if (Math.abs(ticksOff) <= 1) return ticksOff * VALUE;
        else if (ticksOff < 0) return -VALUE;
        else return VALUE;
    }

    // Replaces the current "attitudeJet"
    exports.instrument = {
        stackX: true,
        overlay: {
            url: url.attitudeJet,
            size: {
                x: 200,
                y: 200
            },
            anchor: {
                x: 100,
                y: 100
            },
            position: {
                x: 0,
                y: 110
            },
            rescale: true,
            rescalePosition: true,

            overlays: [

            // attitude-jet-hand
            {
                animations: [{
                    type: "rotate",
                    value: "aroll",
                    ratio: -1,
                    min: -180,
                    max: 180
                }, {
                    type: "translateY",
                    value: "atilt",
                    ratio: -2,
                    offset: 330,
                    min: -90,
                    max: 90
                }],
                url: PAGE_PATH + "images/instruments/attitude-jet-hand.png",
                anchor: {
                    x: 100,
                    y: 70
                },
                size: {
                    x: 200,
                    y: 800
                },
                position: {
                    x: 0,
                    y: 0
                },
                iconFrame: {
                    x: 200,
                    y: 140
                }
            },

            // attitude-jet-pointer
            {
                animations: [{
                    type: "rotate",
                    value: "aroll",
                    ratio: -1,
                    min: -60,
                    max: 60
                }],
                url: PAGE_PATH + "images/instruments/attitude-jet-pointer.png",
                anchor: {
                    x: 100,
                    y: 100
                },
                size: {
                    x: 200,
                    y: 200
                },
                position: {
                    x: 0,
                    y: 0
                }
            },

            // glideslope-indicator
            {
                animations: [{
                    type: 'translateY',
                    value: glideslopeCalc
                }],
                url: url.glideslopeHand,
                anchor: {
                    x: 100,
                    y: 100
                },
                size: {
                    x: 200,
                    y: 200
                },
                position: {
                    x: 0,
                    y: 0
                }
            },

            // localizer-indicator
            {
                animations: [{
                    type: 'translateX',
                    value: localizerCalc
                }],
                url: url.localizerHand,
                anchor: {
                    x: 100,
                    y: 100
                },
                size: {
                    x: 200,
                    y: 200
                },
                position: {
                    x: 0,
                    y: 0
                }
            },

            // attitude-jet
            {
                url: url.attitudeJet,
                anchor: {
                    x: 100,
                    y: 100
                },
                size: {
                    x: 200,
                    y: 200
                },
                position: {
                    x: 0,
                    y: 0
                }
            }]
        }
    };

    // Turns ILS function on/off
    exports.toggleILS = function () {
        // TO BE IMPLEMENTED
    };

});
