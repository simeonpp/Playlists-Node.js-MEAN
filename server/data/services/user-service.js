var User = require('mongoose').model('User'),
    path = require('path');

module.exports = {
    create: function(user, callback) {
        User.create(user, callback);
    },
    update: function (user, callback) {
        User
            .findById(user._id)
            .exec(function (err, dbUser) {
                if (err) {
                    callback(err);
                    return;
                }

                dbUser.email = user.email;
                dbUser.salt = user.salt;
                dbUser.hashPass = user.hashPass;
                dbUser.firstName = user.firstName;
                dbUser.lastName = user.lastName;
                dbUser.facebookAcc = user.facebookAcc;
                dbUser.youtubeAcc = user.youtubeAcc;
                dbUser.avatar = user.avatar;

                dbUser.save(function (err, updatedUser) {
                   if (err) {
                       callback(err);
                   }

                    callback(err, updatedUser);
                });
            })
        
    },
    isAbleToAddUnlimitedVideoURLsToPlaylist: function (user, callback) {
        User
            .findById(user._id)
            .exec(function (err, dbUser) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(err, dbUser.givenRatesNumber >= 10);
            })
    },
    incrementGivenRates: function (user, callback) {
        User
            .findById(user._id)
            .exec(function (err, dbUser) {
                if (err) {
                    callback(err);
                    return;
                }

                var currentGivenRatesNumber = dbUser.givenRatesNumber,
                    newGivenRatesNumber = currentGivenRatesNumber + 1;

                dbUser.givenRatesNumber = newGivenRatesNumber;
                dbUser.save(function (err, updatedDbUser) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    callback(null, updatedDbUser);
                })
            })
    },
    calculateUserRating: function (user, callback) {
        var playlistService = require(path.join(__dirname, 'playlist-service'));
        playlistService.getUsersPlaylists(user, function (err, dbPlaylists) {
            if (err) {
                callback(err);
                return;
            }

            var userRating = 0,
                totalRating = 0,
                iteratedPlaylists = 0;

            dbPlaylists.forEach(function (dbPlaylist) {
                totalRating += dbPlaylist.rating;
                iteratedPlaylists++;
            });

            userRating = totalRating / iteratedPlaylists;
            callback(null, userRating);
        })
    }
};