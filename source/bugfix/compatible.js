"use strict";

define(['bugfix/bowser'], function (bowser) {
    /**
     * Finds if the browser in use is compatible
     *
     * @description Compatible Browsers:
     * - Chrome: >= 37.0
     * - Opera: >= 24.0
     */
    return bowser.check({
        chrome: '37',
        opera: '24'
    });
});
