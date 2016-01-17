var mongoose = require('mongoose'),
    User,
    encryption,
    logger;

function seedInitialUsers () {
    User
        .find({})
        .exec(function(err, collection) {
            if (err) {
                logger.log('Cannot find users: ' + err);
                return;
            }

            if (collection.length === 0) {
                var salt,
                    hashedPassword,
                    i = 1,
                    length = 10,
                    currentUser = {};

                for (i; i <= length; i++) {
                    salt = encryption.generateSalt();
                    hashedPassword = encryption.generateHashedPassword(salt, 'pesho' + i);
                    currentUser = {
                        username: 'pesho' + i,
                        salt: salt,
                        hashPass: hashedPassword,
                        firstName: 'Pesho ' + i,
                        lastName: "Peshe " +  i,
                        email: "pesho" + i + "@abv.bg",
                        facebookAcc: "https://bg-bg.facebook.com/TelerikAcademy",
                        youtubeAcc: "https://www.youtube.com/channel/UCLC-vbm7OWvpbqzXaoAMGGw"
                    };
                    User.create(currentUser);
                }
            }
        });
}

module.exports.init = function (appParams) {
    encryption = require(appParams.encryptionUtilPath);
    logger = require(appParams.loggerPath)();

    var requiredMessage = '{PATH} is required';
    var defaultAvatar = 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png';

    var userSchema = new mongoose.Schema({
        username: { type: String, required: requiredMessage, unique: true },
        salt: String,
        hashPass: String,
        firstName: { type: String, required: requiredMessage},
        lastName: { type: String, required: requiredMessage},
        email: { type: String, required: requiredMessage},
        avatar: { type: String, default: defaultAvatar },
        facebookAcc: { type: String, default: null },
        youtubeAcc: { type: String, default: null },
        rating: { type: Number, default: 0 },
        dateRegistered: { type: Date, default: Date.now },
        givenRatesNumber: { type: Number, default: 0 }
    });

    userSchema.method({
        authenticate: function(password) {
            if (encryption.generateHashedPassword(this.salt, password) === this.hashPass) {
                return true;
            }
            else {
                return false;
            }
        }
    });

    userSchema.path('username').validate(function (value) {
        var regEx = /^[A-Za-z0-9._]{6,20}$/;

        return regEx.test(value);
    });

    userSchema.virtual('fullName').get(function () {
        var currentLastName = this.lastName || ' ';
        return this.firstName + ' ' + currentLastName;
    });

    User = mongoose.model('User', userSchema);

    seedInitialUsers();
};