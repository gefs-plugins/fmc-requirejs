"use strict";

define(['ui/elements'], function (E) {

    // If FMC is production
    var PRODUCTION = false;

    // Stops event propagation
    function stopPropagation (event) {
        event.stopImmediatePropagation();
    }

    return {
        /**
         * Stops input key propagation
         */
        stopPropagation: function () {
            $(E.modal)
                .keyup(stopPropagation)
                .keydown(stopPropagation)
                .keypress(stopPropagation);
        },

        /**
         * Logs debug statement into console when needed if not PRODUCTION
         */
        log: function (text) {
            if (!PRODUCTION) console.log(text);
        }
    };
});
