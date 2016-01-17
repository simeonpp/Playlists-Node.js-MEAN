var path = require('path');

var CONTROLLER_NAME = 'home';

module.exports = function (appParams) {
    var playlistService = require(appParams.servicesPath + '/playlist-service.js');

    function getHome(req, res) {
        playlistService.getTopEightPlaylists(function (err, playlists) {
            res.render('index', {
                playlists: playlists
            })
        });
    }

    return {
        getHome: getHome
    }
};