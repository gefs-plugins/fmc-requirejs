"use strict"; // TODO Properly implement

define(['data'], function (data) {
    return function (airway) {
        return data.ATS[airway];
    };
});
