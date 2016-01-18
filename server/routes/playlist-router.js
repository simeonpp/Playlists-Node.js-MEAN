var express = require('express'),
    path = require('path'),
    ROUTER_NAME = '/playlists';

var init = function (app, appParams) {
    var playlistController = require(path.normalize(appParams.controllerPath + '/playlist-controller'))(appParams),
        playlistRouter = new express.Router(),
        authService = require(appParams.authServicePath);

    playlistRouter.get('/list', playlistController.getList);

    playlistRouter.get('/create', authService.isAuthenticated, playlistController.getCreate);
    playlistRouter.post('/', authService.isAuthenticated, playlistController.postCreate);

    playlistRouter.get('/:id', playlistController.getDetails);
    playlistRouter.get('/:id/videos/:videoURLNumber/delete', authService.isAuthenticated, playlistController.deleteVideoURL);

    playlistRouter.post('/:id/commentAndRate', authService.isAuthenticated, playlistController.postCommentAndRate);
    playlistRouter.post('/:id/delete', authService.isAuthenticated, playlistController.delete);

    app.use(ROUTER_NAME, playlistRouter);
};

module.exports = {
    init: init
};