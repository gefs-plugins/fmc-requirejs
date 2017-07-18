"use strict"; // TODO Properly implement

define(['data'], function (data) {
    return function (airport) {
        return data.STAR[airport];
    };
});
