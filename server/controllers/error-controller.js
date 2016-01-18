var path = require('path');

var CONTROLLER_NAME = 'error';

module.exports = function (appParams) {
    function getNotAuthorized(req, res) {
        res.send('Not authorized');
    }

    function error(req, res) {
        res.send('Page 404.');
    }

    return {
        getNotAuthorized: getNotAuthorized,
        page404: error
    }
};