var User = require('mongoose').model('User');

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
            .findOne({ "_id": user._id }, {"givenRatesNumber": 1})
            .exec(function (err, dbUser) {
                if (err) {
                    callback(err);
                }

                callback(err, dbUser.givenRatesNumber >= 10);
            })
    }
};