var Playlist = require('mongoose').model('Playlist'),
    NodeCache = require('node-cache'),
    cachePlaylistsDataKey = 'topEightPlaylists';

var dataCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } ); // times are in seconds

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

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
                    return;
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
                    return;
                }

                var currentVideoUrls = dbPlaylist.videoURLs;
                var newVideoUrls = currentVideoUrls.filter(function( obj ) {
                    return obj.number != videoNumber
                });

                dbPlaylist.videoURLs = newVideoUrls;
                dbPlaylist.save(function (err, newDbPlaylist) {
                    if (err) {
                        callback(err);
                        return;
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
                    return;
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
                        return;
                    }

                    callback(null, newDbPlaylist);
                });
            })
    },
    checkIfUserCanRateAndComment: function (playlistId, username, callback) {
        if (!username) {
            callback(null, false);
            return;
        }

        Playlist
            .findById(playlistId)
            .exec(function (err, dbPlaylist) {
                if (err) {
                    callback(err);
                    return;
                }

                if (dbPlaylist.creator == username) {
                    callback(null, true);
                    return;
                }

                if (isInArray(username, dbPlaylist.privateUserViewers)) {
                    callback(null, true);
                    return;
                }

                callback(null, false);
            });
    },
    getTopEightPlaylists: function (callback) {
        var cachedTopEightPlaylistsData = dataCache.get(cachePlaylistsDataKey);
        if (cachedTopEightPlaylistsData) {
            callback(null, cachedTopEightPlaylistsData);
        } else {
            Playlist
                .find({ "isPrivate": false })
                .sort({"rating": -1})
                .limit(8)
                .exec(function (err, playlists) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    dataCache.set(cachePlaylistsDataKey, playlists, 600); // 10 minutes
                    callback(null, playlists);
                })
        }
    },
    getList: function (username, sortBy, searchByCat, page, limit, callback) {
        if (sortBy == 'date') {
            sortBy = {"createdOn": -1};
        } else if (sortBy == 'rating') {
            sortBy = {"rating": -1};
        } else {
            sortBy = {"createdOn": -1}; // Default value
        }

        var find = {};
        if (searchByCat) {
            find = { "category": searchByCat };
        }

        Playlist
            .find(find)
            .or([
                { $and: [{isPrivate: true}, {creator: username}] },
                { isPrivate: false },
                { privateUserViewers: username }
            ])
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(function (err, dbPlaylists) {
                if (err) {
                    callback(err);
                    return;
                }

                Playlist
                    .find(find)
                        .or([
                            { $and: [{isPrivate: true}, {creator: username}] },
                            { isPrivate: false },
                            { privateUserViewers: username }
                        ])
                    .count()
                    .exec(function (err, numberOfPlaylist) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        callback(null, dbPlaylists, numberOfPlaylist);
                    });
            });
    },
    delete: function (playlistId, callback) {
        Playlist
            .findById(playlistId)
            .remove()
            .exec(function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null);
            })
    },
    getUsersPlaylists: function (user, callback) {
        Playlist
            .find({ "creator": user.username})
            .exec(function (err, dbPlaylists) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, dbPlaylists)
            })
    }
};