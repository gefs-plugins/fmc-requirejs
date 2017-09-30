"use strict";

define(function () {
    var polyline = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    polyline.setMap(ui.map);

    return {
        path: polyline.getPath()
    };
});
