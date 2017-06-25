"use strict";

define({
    modal: '.fmc-modal',
    container: {
        uiBottom: '.gefs-ui-bottom',
        tabBar: '.fmc-modal .fmc-modal__tab-bar',
        modalContent: '.fmc-modal .fmc-modal__content main',
        depArr: '.fmc-modal .fmc-dep-arr-table-container',
        wptList: '.fmc-modal .fmc-wpt-list-container',
        wptRow: '.fmc-modal .fmc-wpt-list-container .wpt-row',
        wptInfo: '.fmc-modal .fmc-wpt-list-container .wpt-row .fmc-wpt-info',
        arrPage: '.fmc-modal .fmc-arr-container',
        autoTOD: '.fmc-modal .fmc-auto-tod-container',
        vnavPage: '.fmc-modal .fmc-vnav-container',
        vnavPhase: '.fmc-modal .fmc-vnav-phase-container',
        progPage: '.fmc-modal .fmc-prog-container',
        loadPage: '.fmc-modal .fmc-load-container',
        logTable: '.fmc-modal .fmc-log-container',
        logData: '.fmc-modal .fmc-log-container .log-data',
        map: '.fmc-modal .fmc-map-container'
    },
    btn: {
        fmcBtn: 'button.fmc-btn',
        interactive: '.interactive',
        saveWptData: 'button.save-wpt-data',
        retrieveWpt: 'button.retrieve-wpt',
        removeLogData: 'button.remove-log-data',
        close: '.close',
        addWpt: 'button[action="add-wpt"]',
        activateWpt: 'button[action="activate-wpt"]',
        removeWpt: 'button[action="remove-wpt"]',
        moveWptUp: 'button[action="move-wpt-up"]',
        moveWptDown: 'button[action="move-wpt-down"]',
        autoTOD: 'input#auto-tod',
        vnavToggle: 'input#vnav-toggle',
        spdToggle: 'input#spd-toggle',
        togglePhase: 'button.toggle-phase',
        lockPhase: 'button.lock-phase',
        loadWpt: 'button.load-wpt',
        generateRte: 'button.generate-rte',
        clearRte: 'button.clear-rte'
    },
    input: {
        dep: 'input.dep',
        arr: 'input.arr',
        fn: 'input.fn',
        wpt: 'input.wpt',
        lat: 'input.lat',
        lon: 'input.lon',
        alt: 'input.alt',
        todDist: 'input.tod-dist',
        fieldElev: 'input.field-elev',
        cruiseAlt: 'input.cruise-alt',
        loadWpt: 'input.load-wpt'
    },
    textarea: 'textarea.generate-rte'
});
