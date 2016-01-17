var express = require('express'),
    path = require('path'),
    ROUTER_NAME = '/';

var init = function (app, appParams) {
    var errorController = require(path.normalize(appParams.controllerPath + '/error-controller'))(appParams),
        errorRouter = new express.Router();

    errorRouter.get('/notAuthorized', errorController.getNotAuthorized);

    app.use(ROUTER_NAME, errorRouter);
};

module.exports = {
    init: init
};