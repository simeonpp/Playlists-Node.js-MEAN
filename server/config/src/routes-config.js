var fs = require('fs'),
    path = require('path');

module.exports = function(app, appParams, config) {
    /**
     * Load configuration
     * Looks up for files in ./server/controllers folder and loads each file with '-controller' in its name
     */
    var logger = require(appParams.loggerPath)(appParams),
        authService = require(appParams.authServicePath);

    var files = fs.readdirSync(appParams.routesPath);
    files
        .filter(function (file) {
            return file.indexOf('-router') >= 0;
        })
        .forEach(function (file) {
            logger.debug('Loading route ' + file);
            require(path.normalize(appParams.routesPath + '/' + file)).init(app, appParams);
        });

    var playlistService = require(appParams.servicesPath + '/playlist-service.js');

    app.get('/', function (req, res) {
        playlistService.getTopEightPlaylists(function (err, playlists) {
            res.render('index', {
                playlists: playlists
            })
        });
    });

    app.get('*', function(req, res) {
        res.redirect('/');
    });

    logger.debug('Routes configured.');
};