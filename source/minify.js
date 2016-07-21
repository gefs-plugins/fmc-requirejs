/**
 * @license minify Copyright (c) 2016 Harry Xue
 * Licensed under the MIT License (MIT)
 */

'use strict';

define(['text'], function (text) {

    var buildMap = {};

    /**
     * Removes white space from a string (HTML and CSS only)
     *
     * @param {String} content The string to be trimmed and minified
     * @returns {String} Content that has been minified
     */
    function minify (content) {
        return content.replace(/\r/g, "") // Carriage return
            .replace(/\n\s+/g, "") // New line followed by white space
            .replace(/\n/g, "") // Extra new lines
            .replace(/\t/g, "") // Extra tabs
            .replace(/'/g, "\\'") // Single quotes
            .replace(/\s*{/g, "{") // CSS open brace
            .replace(/\s*\:\s*/g, ":") // CSS definition colons
            .replace(/\s*;\s*/g, ";") // CSS semi-colons
            .replace(/\s*\/\*[^]*?\*\/\s*/g, "") // CSS comments
            .replace(/\s*<!--[^]*?-->\s*/g, ""); // HTML comments
    }

    return {
        /**
         * Executes minify() when module is required
         *
         * @param {String} name Name of this module
         * @param {Object} req XHR request object passed in by requirejs
         * @param {Function} onLoad Callback function to update content
         * @param {Object} config Determine request type
         */
        load: function (name, req, onLoad, config) {
            if (config && config.isBuild && !config.inlineText) {
                onLoad(null);
            } else {
                text.get(req.toUrl(name), function (content) {
                    buildMap[name] = minify(content);
                    onLoad(buildMap[name]);
                });
            }
        },

        /**
         * Turns passed in content into a requirejs module when being built
         *
         * @param {String} pluginName Name of this module when it is required
         * @param {String} moduleName Name of the module that required this one
         * @param {Function} write Callback function to write as module
         */
        write: function (pluginName, moduleName, write) {
            if (moduleName in buildMap) {
                var content = buildMap[moduleName];
                write("define('" + pluginName + "!" + moduleName
                    + "', function () { return '" + content + "';});\n");
            }
        }
    };
});
