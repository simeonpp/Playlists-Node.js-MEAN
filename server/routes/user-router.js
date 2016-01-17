var express = require('express'),
    path = require('path'),
    ROUTER_NAME = 'user';

var init = function (app, appParams) {
    var userController = require(path.normalize(appParams.controllerPath + '/users-controller'))(appParams),
        userRouter = new express.Router(),
        authService = require(appParams.authServicePath);

    userRouter.get('/register', userController.getRegister);
    userRouter.post('/register', userController.postRegister);

    userRouter.post('/profile/update', userController.update);

    userRouter.get('/login', userController.getLogin);
    userRouter.post('/login', userController.login);
    userRouter.get('/logout', userController.logout);

    userRouter.get('/profile', authService.isAuthenticated, userController.profile);

    app.use(userRouter);
};

module.exports = {
    init: init
};