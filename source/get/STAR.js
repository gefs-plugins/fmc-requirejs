"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all STAR info for airport
     *
     * @param {String} airport
     * @returns {Array} The array of STAR
     */
    return function getSTAR (airport) {
        return data.STAR[airport] || [];
    };

});
