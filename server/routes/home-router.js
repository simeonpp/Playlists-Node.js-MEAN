var express = require('express'),
    path = require('path'),
    ROUTER_NAME = '/';

var init = function (app, appParams) {
    var homeController = require(path.normalize(appParams.controllerPath + '/home-controller'))(appParams),
        homeRouter = new express.Router();

    homeRouter.get('/', homeController.getHome);

    app.use(ROUTER_NAME, homeRouter);
};

module.exports = {
    init: init
};