var passport = require('passport');

var CONTROLLER_NAME = 'playlists';

module.exports = function (appParams) {
    var playlistService = require(appParams.servicesPath + '/playlist-service.js'),
        userService = require(appParams.servicesPath + '/user-service.js'),
        logger = require(appParams.loggerPath)(appParams);

    function getCreate(req, res) {
        var categories = require('../common/constants.js').playlistCategories;

        userService.isAbleToAddUnlimitedVideoURLsToPlaylist(req.user, function (err, ableToUnlimitedVideoURLs) {
            res.render(CONTROLLER_NAME + '/create', {
                categories: categories,
                ableToUnlimitedVideoURLs: ableToUnlimitedVideoURLs
            });
        });
    }

    function postCreate(req, res) {
        var newPlaylistData = req.body,
            youtubeUrlRegEx = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

        userService.isAbleToAddUnlimitedVideoURLsToPlaylist(req.user, function (err, ableToUnlimitedVideoURLs) {
            if (!newPlaylistData.title && newPlaylistData.title  == '') {
                req.session.error = 'Title is required.';
                res.redirect('/playlists/create');
                return;
            } else if (!newPlaylistData.description  && newPlaylistData.description == '') {
                req.session.error = 'Description is required.';
                res.redirect('/playlists/create');

                return;
            } else if (!youtubeUrlRegEx.test(newPlaylistData.videoURL_0)) {
                req.session.error = 'Invalid Youtube video URL.';
                res.redirect('/playlists/create');
                return;
            } else if (!newPlaylistData.private) {
                newPlaylistData.isPrivate = false;
            } else if (newPlaylistData.private) {
                newPlaylistData.isPrivate = true;
            }

            newPlaylistData.privateUserViewers = [];
            newPlaylistData.videoURLs = [];
            var addedVideoURLs = 0;
            // get youtube urls and user that are authorized to view this playlist
            for(var property  in newPlaylistData) {
                if (property.indexOf('videoURL_') >= 0) {
                    if (newPlaylistData.hasOwnProperty(property)) {
                        if (addedVideoURLs > 10 &&  !ableToUnlimitedVideoURLs) {
                            continue;
                        } else {
                            var youtubeUrl = newPlaylistData[property],
                                youtubeUrlObject = {
                                    number: addedVideoURLs,
                                    url: youtubeUrl
                                };
                            newPlaylistData.videoURLs.push(youtubeUrlObject);
                        }

                        addedVideoURLs++
                    }
                } else if (property.indexOf('private_user_can_view_') >= 0) {
                    var username = newPlaylistData[property];
                    newPlaylistData.privateUserViewers.push(username);
                }
            }

            newPlaylistData.creator = req.user.username;

            playlistService.create(newPlaylistData, function (err, playlist) {
                if (err) {
                    logger.log('Failed to create new playlist: ' + err);
                    req.session.error = err.message;
                    res.redirect('/playlists/create');
                    return;
                }

                res.redirect('/playlists/' + playlist._id);
            });
        });
    }

    function getDetails(req, res) {
        playlistService.getById(req.params.id, function (err, playlist) {
            var isAuthor = false,
                currnetUsername = '';

            if (req.user) {
                isAuthor = req.user.username == playlist.creator;
                currnetUsername = req.user.username;
            }

            playlistService.checkIfUserIsAllowedToPrivatePlaylist(req.params.id, currnetUsername, function (err, boolResult) {
                if (playlist.isPrivate && boolResult) {
                    res.render(CONTROLLER_NAME + '/details', {
                        playlist: playlist,
                        isAuthor: isAuthor,
                        isAllowedToPostComment: boolResult
                    });
                    return;
                } else {
                    res.redirect('/playlists');
                }

            });
        });
    }

    function deleteVideoURL(req, res) {
        var playlistId = req.params.id,
            videoURLNumber = req.params.videoURLNumber;

        playlistService.deleteByPlaylistIdAndVideoNumber(playlistId, videoURLNumber, function (err, playlist) {
            if (err) {
                logger.error(err);
                return;
            }

            res.redirect('/playlists/' + playlistId);
        });
    }

    function postCommentAndRate(req, res) {
        var playlistId = req.params.id,
            rate = req.body.rate,
            comment = req.body.comment;

        playlistService.postRateAndService(playlistId, rate, comment, req.user.username, function (err, playlist) {
            if (err) {
                logger.error(err);
                return;
            }

            res.redirect('/playlists/' + playlistId);
        })
    }

    function getList(req, res) {
        var categories = require('../common/constants.js').playlistCategories,
            username = false,
            sortBy = {},
            searchByCat = false;

        if (req.query && req.query.sortBy) {
            if (req.query.sortBy == 'date') {
                sortBy = {"createdOn": -1};
            }

            if (req.query.sortBy == 'rating') {
                sortBy = {"rating": -1};
            }
        }

        if (req.query && req.query.searchByCategory) {
            searchByCat = req.query.searchByCategory;
        }

        if (req.user) {
            username = req.user.username;
        }

        playlistService.getList(username, sortBy, searchByCat, function (err, playlists) {
            if (err) {
                logger.error(err);
                return;
            }

            res.render(CONTROLLER_NAME + '/list', {
                playlists: playlists,
                categories: categories
            });
        });
    }

    return {
        getCreate: getCreate,
        postCreate: postCreate,
        getDetails: getDetails,
        deleteVideoURL: deleteVideoURL,
        postCommentAndRate: postCommentAndRate,
        getList: getList
    }
};