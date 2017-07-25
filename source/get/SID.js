"use strict";

define(['knockout', 'data'], function (ko, data) {

    /**
     * Get all SID info for airport and departure runway
     *
     * @param {String} airport
     * @returns {Array} The array of SID
     */
    return function (airport, runway) {
        if (!airport || !runway[0]) return [];

        var allSID = data.SID[airport];
        var validSID = [];

        allSID.forEach(function (obj) {
            if (obj.runway === runway) validSID.push(obj);
        });

        return validSID;
    };

});
