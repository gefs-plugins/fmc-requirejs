"use strict";

define(['knockout', 'map/style'], function (ko, style) {

    var map = ui.map;
    var polyline = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    var path = polyline.getPath();
    polyline.setMap(map);

    return {
        path: path
    };

});
