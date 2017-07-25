"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all STAR info for airport and arrival runway
     *
     * @param {String} airport
     * @returns {Array} The array of STAR
     */
    return function (airport, runway) {
        if (!airport || !runway[0]) return [];

        var allSTAR = data.STAR[airport];
        var validSTAR = [];

        allSTAR.forEach(function (obj) {
            if (obj.runway === runway) validSTAR.push(obj);
        });

        return validSTAR;
    };

});
