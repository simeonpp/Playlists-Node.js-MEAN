var path = require('path'),
    rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://localhost:27017/youtubePlaylistSystem',
        port: process.env.PORT || 1234,
        showDebugMessages: true
    },
    production: {
        rootPath: rootPath,
        db: 'mongodb://admin:qwefwedggrw.mongolab.com:27328/DB_NAME',
        port: process.env.PORT || 3030,
        showDebugMessages: false
    }
};