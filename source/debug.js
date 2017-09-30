"use strict";

define(['ui/elements'], function (E) {

    // Stops event propagation
    function stopPropagation (event) {
        event.stopImmediatePropagation();
    }

    return {
        // If FMC is production
        PRODUCTION: false,

        /**
         * Stops input key propagation
         */
        stopPropagation: function () {
            $(E.modal).find('input')
                .keyup(stopPropagation)
                .keydown(stopPropagation)
                .keypress(stopPropagation);
        },

        /**
         * Logs debug statement into console when needed if not PRODUCTION
         */
        log: function (text) {
            if (!this.PRODUCTION) console.log(text);
        }
    };
});
