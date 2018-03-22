"use strict";

define(function () {
    var polyline = new google.maps.Polyline({
        geodesic: true,
        strokeColor: '#7b7c14',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    return {
        polyline: polyline,
        path: polyline.getPath()
    };
});
