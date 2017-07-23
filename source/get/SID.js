"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all SID info for airport
     *
     * @param {String} airport
     * @returns {ko.observableArray} The array of SID
     */
    return function getSID (airport) {
        return ko.observableArray(data.SID[airport]);
    };

});
