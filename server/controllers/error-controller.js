var path = require('path');

var CONTROLLER_NAME = 'error';

module.exports = function (appParams) {
    function getNotAuthorized(req, res) {
        res.send('Not authorized');
    }

    return {
        getNotAuthorized: getNotAuthorized
    }
};