"use strict";

define(['data'], function (data) {

    /**
     * Get all SID info for airport and departure runway
     *
     * @param {String} airport
     * @returns {Array} The array of SID
     */
    return function (airport, runway) {
        if (!airport || !runway) return [];

        var allSID = data.SID[airport];
        var validSID = [];

        if (Array.isArray(allSID))
            allSID.forEach(function (obj) {
                if (obj.runway === runway) validSID.push(obj);
            });

        return validSID;
    };

});
