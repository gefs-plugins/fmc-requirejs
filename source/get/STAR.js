"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all STAR info for airport
     *
     * @param {String} airport
     * @returns {ko.observableArray} The array of STAR
     */
    return function getSTAR (airport) {
        return ko.observableArray(data.STAR[airport]);
    };

});
