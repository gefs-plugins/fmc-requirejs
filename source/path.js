"use strict";

define(['geodesic'], function () {

    /**
     * Updates path based on previous and current waypoint info
     *
     * @param {Waypoint} prevWaypoint
     * @param {Waypoint} curWaypoint
     */
    L.Geodesic.prototype.update = function (prevWaypoint, curWaypoint) {
        // No previous or current waypoint
        if (!prevWaypoint || !prevWaypoint.lat() || !prevWaypoint.lon()
            || !curWaypoint || !curWaypoint.lat() || !curWaypoint.lon()) {
            this.setLatLngs([]);
            return;
        }

        var prev = L.latLng(prevWaypoint.lat(), prevWaypoint.lon());
        var cur = L.latLng(curWaypoint.lat(), curWaypoint.lon());
        this.options.steps = Math.ceil(curWaypoint.distFromPrev() / 10);
        this.setLatLngs([[ prev, cur ]]);
    };

    return function Path () {
        return L.geodesic([], { weight: 2 }).addTo(ui.mapInstance.apiMap.map);
    };

});
