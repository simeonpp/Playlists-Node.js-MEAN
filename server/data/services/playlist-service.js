var Playlist = require('mongoose').model('Playlist');

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

var cache = {
    expires: undefined,
    data: undefined
};

function getMinutesDiffFromToday(dateToCheck) {
    var today = new Date();
    var diffMs = (dateToCheck - today);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return diffMins;
}

module.exports = {
    create: function(playlist, callback) {
        Playlist.create(playlist, callback);
    },
    getById: function (playlistId, callback) {
        Playlist
            .findById(playlistId)
            .exec(function (err, dbPlaylist) {
                if (err) {
                    callback(err);
                }

                callback(null, dbPlaylist);
            })
    },
    deleteByPlaylistIdAndVideoNumber: function (playlistId, videoNumber, callback) {
        Playlist
            .findById(playlistId)
            .exec(function (err, dbPlaylist) {
                if (err) {
                    callback(err);
                }

                var currentVideoUrls = dbPlaylist.videoURLs;
                var newVideoUrls = currentVideoUrls.filter(function( obj ) {
                    return obj.number != videoNumber
                });

                dbPlaylist.videoURLs = newVideoUrls;
                dbPlaylist.save(function (err, newDbPlaylist) {
                    if (err) {
                        callback(err);
                    }

                    callback(null, newDbPlaylist);
                });
            })
    },
    postRateAndService: function (playlistId, rate, comment, username, callback) {
        rate = Number(rate);

        Playlist
            .findById(playlistId)
            .exec(function (err, dbPlaylist) {
                if (err) {
                    callback(err);
                }

                // Rating
                var givenRatesNumber = Number(dbPlaylist.giveRates),
                    totalRatings = Number(dbPlaylist.totalRating),
                    newRate,
                    newGivenRates,
                    newTotalRating;

                if (givenRatesNumber == 0) {
                    newGivenRates = 1;
                    newTotalRating = rate;
                    newRate = rate;
                } else {
                    newGivenRates = givenRatesNumber + 1;
                    newTotalRating = totalRatings + rate;
                    newRate = newTotalRating / newGivenRates;
                }

                dbPlaylist.giveRates = newGivenRates;
                dbPlaylist.totalRating = newTotalRating;
                dbPlaylist.rating = newRate;

                // Comment
                var currentComments = dbPlaylist.comments,
                    varCommentObject = {
                        comment: comment,
                        username: username
                    };

                currentComments.push(varCommentObject);

                dbPlaylist.save(function (err, newDbPlaylist) {
                    if (err) {
                        callback(err);
                    }

                    callback(null, newDbPlaylist);
                });
            })
    },
    checkIfUserIsAllowedToPrivatePlaylist: function (playlistId, username, callback) {
        Playlist
            .findById(playlistId)
            .exec(function (err, dbPlaylist) {
                if (err) {
                    callback(err);
                }

                if (dbPlaylist.creator == username) {
                    callback(null, true);
                }

                if (isInArray(username, dbPlaylist.privateUserViewers)) {
                    callback(null, true);
                }

                callback(null, false);
            });
    },
    getTopEightPlaylists: function (callback) {
        Playlist
            .find({ "isPrivate": false })
            .sort({"rating": -1})
            .limit(8)
            .exec(function (err, playlists) {
                if (err) {
                    callback(err);
                }

                if (cache.expires && getMinutesDiffFromToday(cache.expires) > 10 ) {
                    callback(null, cache.data);
                } else {
                    var d1 = new Date (),
                        d2 = new Date ( d1 );
                    d2.setMinutes ( d1.getMinutes() + 10);

                    cache.data = playlists;
                    cache.expires = d2;

                    callback(null, playlists);
                }
            })
    },
    getList: function (username, sortBy, searchByCat, callback) {
        if (username) {
            var findQuery;

            if (searchByCat) {
                findQuery = { $or: [ { "isPrivate": false }, { $and: [ {"category": searchByCat}, { "privateUserViewers": { $regex: '.*\Q' + username + '\E.*', $options: 'i' } } ] } ] };
            } else {
                findQuery = { $or: [ { "isPrivate": false }, { $and: [ { "privateUserViewers": { $regex: '.*\Q' + username + '\E.*', $options: 'i' } } ] } ] };
            }

            Playlist
                .find(findQuery)
                .sort(sortBy)
                .exec(function (err, playlists) {
                    if (err) {
                        callback(err, playlists)
                    }

                    callback(null, playlists);
                })
        } else {
            var findQuery;

            if (searchByCat) {
                findQuery = { "isPrivate": false, "category": searchByCat };
            } else {
                findQuery = { "isPrivate": false };
            }

            Playlist
                .find(findQuery)
                .sort(sortBy)
                .exec(function (err, playlists) {
                    if (err) {
                        callback(err, playlists)
                    }

                    callback(null, playlists);
                })
        }
    }
};