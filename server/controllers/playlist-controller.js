var passport = require('passport');

var CONTROLLER_NAME = 'playlists';

module.exports = function (appParams) {
    var playlistService = require(appParams.servicesPath + '/playlist-service.js'),
        userService = require(appParams.servicesPath + '/user-service.js'),
        logger = require(appParams.loggerPath)(appParams);

    function getCreate(req, res) {
        var categories = require('../common/constants.js').playlistCategories;

        userService.isAbleToAddUnlimitedVideoURLsToPlaylist(req.user, function (err, ableToUnlimitedVideoURLs) {
            console.log(ableToUnlimitedVideoURLs);
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
                    if (username != '') {
                        newPlaylistData.privateUserViewers.push(username);
                    }
                }
            }

            newPlaylistData.creator = req.user.username;

            playlistService.create(newPlaylistData, function (err, playlist) {
                if (err) {
                    logger.log('Failed to create new playlist: ' + err);
                    req.session.error = err.message;
                    res.redirect('/playlists/create');
                }

                res.redirect('/playlists/' + playlist._id);
            });
        });
    }

    function getDetails(req, res) {
        playlistService.getById(req.params.id, function (err, playlist) {
            if (err) {
                logger.error(err);
                res.redirect('/error');
                return;
            }

            var isAuthor = false,
                currentUsername = undefined;

            if (req.user) {
                isAuthor = req.user.username == playlist.creator;
                currentUsername = req.user.username;
            }

            playlistService.checkIfUserCanRateAndComment(req.params.id, currentUsername, function (err, boolResult) {
                if (err) {
                    logger.error(err);
                    res.redirect('/error');
                    return;
                }

                // Check if is authorized to view this playlist
                if ((playlist.isPrivate && !currentUsername) || (playlist.isPrivate && !boolResult)) {
                    res.redirect('/notAuthorized');
                    return;
                }

                res.render(CONTROLLER_NAME + '/details', {
                    playlist: playlist,
                    isAuthor: isAuthor,
                    isAllowedToRateAndComment: boolResult
                });
            });
        });
    }

    function deleteVideoURL(req, res) {
        var playlistId = req.params.id,
            videoURLNumber = req.params.videoURLNumber;

        playlistService.deleteByPlaylistIdAndVideoNumber(playlistId, videoURLNumber, function (err, playlist) {
            if (err) {
                logger.error(err);
                res.redirect('/error');
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
                res.redirect('/error');
                return;
            }

            // Update user give rates
            userService.incrementGivenRates(req.user, function (err, updatedDbUser) {
                if (err) {
                    logger.error(err);
                    res.redirect('/error');
                    return;
                }

                res.redirect('/playlists/' + playlistId);
            });

        })
    }

    function getList(req, res) {
        var categories = require('../common/constants.js').playlistCategories,
            username = false,
            sortBy = 'date',
            searchByCategory = false;

        categories = categories.map(function (category) {
             var currentCategoryName = category,
                 categoryObject = {};

            categoryObject.isSelected = null;
            categoryObject.name = currentCategoryName;
            return categoryObject;
        });

        if (req.query && req.query.sortBy) {
            sortBy = req.query.sortBy;
        }

        if (req.query && req.query.searchByCategory) {
            searchByCategory = req.query.searchByCategory;

            var i = 0,
                length = categories.length,
                currentCategory;
            for(i; i < length; i += 1) {
                currentCategory = categories[i];
                if (currentCategory.name == req.query.searchByCategory) {
                    currentCategory.isSelected = 'selected';
                }
            }
        }

        if (req.user) {
            username = req.user.username;
        }

        playlistService.getList(username, sortBy, searchByCategory, function (err, playlists) {
            if (err) {
                logger.error(err);
                res.redirect('/error');
                return;
            }

            res.render(CONTROLLER_NAME + '/list', {
                playlists: playlists,
                categories: categories,
                sortBy: sortBy,
                searchByCategory: searchByCategory
            });
        });
    }

    function deletePlaylist(req, res) {
        playlistService.delete(req.params.id, function (err) {
            if (err) {
                logger.error(err);
            }

            res.redirect('/playlists');
        })
    }

    return {
        getCreate: getCreate,
        postCreate: postCreate,
        getDetails: getDetails,
        deleteVideoURL: deleteVideoURL,
        postCommentAndRate: postCommentAndRate,
        getList: getList,
        delete: deletePlaylist
    }
};