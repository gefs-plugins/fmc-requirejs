'use strict';

module.exports = {
    ROOT_FOLDER: 'data/',
    readDir: dir => {
        let list = [];
        require('fs').readdirSync(dir).forEach(function (file) {
            if (/\.txt/.test(file)) list.push(file);
        });

        return list;
    }
};
