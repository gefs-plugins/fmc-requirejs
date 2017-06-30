"use strict";

define(['math', 'exports'], function (math, exports) {

    // Glideslope, in degrees (default = 3)
    exports.glideslope = 3;

    // Threshold lat/lon
    exports.thresholdCoords = [];

    // Opposite end lat/lon
    exports.oppositeCoords = [];

    // URLs of instruments
    var dev = true; // Temporary
    var DEV_BASE = '/fmc/images/';
    var BASE = '';
    var url = {
        attitudeJetILS: PAGE_PATH + dev ? DEV_BASE : BASE + 'attitude-jet-ils.png',
        glideslopeHand: PAGE_PATH + dev ? DEV_BASE : BASE + 'glideslope-indicator.png',
        localizerHand: PAGE_PATH + dev ? DEV_BASE : BASE + 'localizer-indicator.png'
    };

    /**
     * Calculates the deviation value of glideslope
     *
     * @returns {Number} The value of glideslope deviation
     */
    function glideslopeCalc () { // TODO
        var gs = exports.glideslope;
        var threshold = exports.thresholdCoords;
        var current = geofs.aircraft.instance.llaLocation;

        if (!(threshold[0] && threshold[1] && current[0] && current[1] && current[2])) return 0;

        var distanceToThreshold = math.getDistance(current[0], current[1], threshold[0], threshold[1]);
        var targetAltitude = Math.atan(math.toRadians(gs)) * distanceToThreshold;

        return targetAltitude - current[2]; // FIXME Take ground elevation into account
    }

    /**
     * Calculates the deviation value of localizer
     *
     * @returns {Number} The value of localizer deviation
     */
    function localizerCalc () { // TODO
        var threshold = exports.thresholdCoords;
        var opposite = exports.oppositeCoords;
        var current = geofs.aircraft.instance.llaLocation;

        if (!(threshold[0] && threshold[1] && opposite[0] && opposite[1] && current[0])) return 0;
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
