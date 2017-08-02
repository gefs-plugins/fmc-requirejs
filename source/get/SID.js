"use strict";

define(['data'], function (data) {

    /**
     * Get all SID info for airport and departure runway
     *
     * @param {String} airport
     * @param {String} runway
     * @param {String} selectedSIDName Allows SID to be selected before a runway
     * @returns {Array} The array of SID
     */
    return function (airport, runway, selectedSIDName) {
        // If there is no departure airport
        if (!airport) return [];

        var allSID = data.SID[airport] || [];
        var validSID = [];

        // If a SID is already selected
        if (selectedSIDName) {
            // If SID is selected before runway, return selected SID name and a list of available runways
            if (!runway) {
                var availableRunways = [];

                allSID.forEach(function (obj) {
                    if (obj.name === selectedSIDName) availableRunways.push(obj.runway);
                });

                validSID.push({
                    name: selectedSIDName,
                    availableRunways: availableRunways
                });
            }


            // If both a SID and a runway are selected
            else {
                allSID.forEach(function (obj) {
                    if (obj.name === selectedSIDName && obj.runway === runway) validSID.push(obj);
                });
            }
        }

        // If there is no SID selected
        else {
            // List of SID names (no runways, no duplicates)
            if (!runway) {
                var tempSIDArray = [];

                allSID.forEach(function (obj) {
                    if (tempSIDArray.indexOf(obj.name) === -1) tempSIDArray.push(obj.name);
                });

                tempSIDArray.forEach(function (element) {
                    validSID.push({ name: element });
                });
            }

            // List of SID names (with runways)
            else {
                allSID.forEach(function (obj) {
                    if (obj.runway === runway) validSID.push(obj);
                });
            }
        }

        // Returns the list of SID
        return validSID;
    };

});
