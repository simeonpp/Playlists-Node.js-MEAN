var passport = require('passport');

var CONTROLLER_NAME = 'users';

module.exports = function (appParams) {
    var userService = require(appParams.servicesPath + '/user-service'),
        encryption = require(appParams.encryptionUtilPath),
        logger = require(appParams.loggerPath)(appParams);

    function getRegister(req, res) {
        res.render(CONTROLLER_NAME + '/register')
    }

    function getLogin(req, res) {
        res.render(CONTROLLER_NAME + '/login');
    }

    function postRegister(req, res) {
        var newUserData = req.body;

        if (newUserData.password != newUserData.confirmPassword) {
            req.session.error = 'Passwords do not match.';
            res.redirect('/register');
        } else {
            newUserData.salt = encryption.generateSalt();
            newUserData.hashPass = encryption.generateHashedPassword(newUserData.salt, newUserData.password);

            if (newUserData.facebookAcc == '') {
                newUserData.facebookAcc = null;
            }

            if (newUserData.youtubeAcc == '') {
                newUserData.youtubeAcc = null;
            }

            if (newUserData.avatar == '') {
                newUserData.avatar = 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png';
            }

            userService.create(newUserData, function(err, user) {
                if (err) {
                    logger.log('Failed to register new user: ' + err);
                    req.session.error = err.toString();
                    res.redirect('/register');
                    return;
                }

                req.logIn(user, function(err) {
                    if (err) {
                        req.session.error = "Invalid credentials.";
                        res.redirect('/login');
                    }
                    else {
                        res.redirect('/');
                    }
                })
            });
        }
    }

    function login(req, res, next) {
        var auth = passport.authenticate('local', function(err, user) {
            if (err) return next(err);
            if (!user) {
                req.session.error = "Invalid credentials.";
                res.redirect('/login');
            }

            req.logIn(user, function(err) {
                if (err) return next(err);
                res.redirect('/');
            })
        });

        auth(req, res, next);
    }

    function logout(req, res) {
        req.logout();
        res.redirect('/');
    }

    function profile(req, res) {
        userService.calculateUserRating(req.user, function (err, userRating) {
            if (err) {
                logger.error(err);
                res.redirect('error');
                return;
            }

            res.render(CONTROLLER_NAME + '/profile', {
                userRating: userRating
            })
        });
    }

    function update(req, res) {
        var updateUserData = req.body;

        if (updateUserData.password != updateUserData.confirmPassword) {
            req.session.error = 'Passwords do not match.';
            res.redirect('/register');
        } else {
            updateUserData.salt = encryption.generateSalt();
            updateUserData.hashPass = encryption.generateHashedPassword(updateUserData.salt, updateUserData.password);

            if (updateUserData.facebookAcc == '') {
                updateUserData.facebookAcc = null;
            }

            if (updateUserData.youtubeAcc == '') {
                updateUserData.youtubeAcc = null;
            }

            if (updateUserData.avatar == '') {
                updateUserData.avatar = 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png';
            }

            updateUserData._id = req.user._id;

            userService.update(updateUserData, function(err, user) {
                if (err) {
                    logger.log('Failed to update user: ' + err);
                    req.session.error = err.message;
                    res.redirect('/register');
                    return;
                }

                req.logout();
                res.redirect('/login');
            });
        }
    }

    return {
        getRegister: getRegister,
        getLogin: getLogin,
        postRegister: postRegister,
        logout: logout,
        login: login,
        profile: profile,
        update: update
    }
};