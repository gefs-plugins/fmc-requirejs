({
    baseUrl: "./source",
    name: "../node_modules/requirejs/require",
    include: "main",
    mainConfigFile: "./source/config.js",
    out: "./build/fmc.min.js",
    optimize: "uglify2"
});
