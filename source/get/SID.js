"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all SID info for airport
     *
     * @param {String} airport
     * @returns {Array} The array of SID
     */
    return function getSID (airport) {
        return data.SID[airport] || [];
    };

});
