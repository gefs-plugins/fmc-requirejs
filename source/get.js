"use strict";

define(['get/waypoint', 'get/ATS', 'get/SID', 'get/STAR', 'get/runway'], function (a, b, c, d, e) {
    return {
        waypoint: a,
        ATS: b,
        SID: c,
        STAR: d,
        runway: e
    };
});
