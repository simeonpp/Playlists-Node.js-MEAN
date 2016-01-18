var mongoose = require('mongoose'),
    Playlist,
    logger;

function seedIntialPlaylist(appParams) {
    Playlist
        .find({})
        .exec(function (err, collection) {
            if (err) {
                logger.log('Cannot find playlists: ' + err);
            }

            if (collection.length == 0) {
                var i = 1,
                    length = 50,
                    currentPlaylist = {},
                    categories = require(appParams.constantsPath).playlistCategories,
                    randomCategory,
                    randomPrivate;

                for (i; i <= length; i++) {
                    randomCategory = categories[Math.floor(Math.random() * (categories.length - 0 + 1) + 0)];
                    randomPrivate = Math.floor(Math.random() * (1 - 0 + 1) + 0) == 1;

                    currentPlaylist = new Playlist({
                        title: 'Playlist title ' + i,
                        description: 'Playlist description blah blah blah ' + i,
                        videoURLs: [
                            'https://www.youtube.com/watch?v=s69BQVI5em0',
                            'https://www.youtube.com/watch?v=nkcgTOlNuUw'
                        ],
                        category: randomCategory,
                        creator: 'pesho' + i,
                        isPrivate: randomPrivate,
                        privateUserViewers: 'pesho 1'
                    });

                    currentPlaylist.save(function (err, dbPlaylist) {
                        if (err) {
                            logger.error(err);
                        }
                    })
                }
            }
        });
}

module.exports.init = function (appParams) {
    logger = require(appParams.loggerPath)();

    var requiredMessage = '{PATH} is required';

    var playlistSchema = new mongoose.Schema({
        title: {type: String, required: requiredMessage},
        description: {type: String, required: requiredMessage },
        videoURLs: {type: [{}]},
        category: {type: String, required: requiredMessage},
        creator: {type: String, required: requiredMessage},
        createdOn: { type: Date, default: Date.now },
        isPrivate: {type: Boolean, default: false},
        privateUserViewers: {type: [String]},
        totalRating: {type: Number, default: 0},
        giveRates: {type: Number, default: 0},
        rating: {type: Number, default: 0},
        comments: {type: [{}]}
    });

    Playlist = mongoose.model('Playlist', playlistSchema);

    seedIntialPlaylist(appParams);
};