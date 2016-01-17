var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    busboy = require('connect-busboy'),
    passport = require('passport');

function loadCustomMiddleware(app, appParams) {
    var utils = require(path.join(appParams.rootPath, 'common', 'utils.js'));

    // Session
    app.use(function (req, res, next) {
        if (req.session.error) {
            var msg = req.session.error;
            req.session.error = undefined;
            app.locals.errorMessage = msg;
        }
        else {
            app.locals.errorMessage = undefined;
        }

        next();
    });

    // User
    app.use(function (req, res, next) {
        if (req.user) {
            app.locals.currentUser = req.user;
        } else {
            app.locals.currentUser = undefined;
        }

        next();
    });

    // Moment js
    app.locals.moment = require('moment');
}

function loadCustomViewLocals(app, appParams) {
    app.locals.siteTitle = appParams.siteTitle;
}

module.exports = function (app, appParams, config) {
    var logger = require(appParams.loggerPath)(appParams);
    logger.debug('Setting app middleware and view engine.');

    app
        .set('views', path.normalize(appParams.viewsPath))
        .set('view engine', 'jade')
        .use(cookieParser())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended: true}))
        .use(busboy({immediate: false}))
        .use(session({secret: 'magic unicorns', resave: true, saveUninitialized: true}))
        .use(passport.initialize())
        .use(passport.session())
        .use(express.static(appParams.rootPath + '/public'));

    loadCustomMiddleware(app, appParams);
    loadCustomViewLocals(app, appParams);
};