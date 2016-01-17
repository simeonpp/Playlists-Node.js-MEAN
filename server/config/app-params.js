var path = require('path');

module.exports = function (config) {
    return {
        rootPath: path.normalize(config.rootPath),
        rootServerPath: path.normalize(config.rootPath + '/server'),
        publicPath: path.normalize(config.rootPath + '/public'),
        loggerPath: path.normalize(config.rootPath + '/server/common/logger.js'),
        modelsPath: path.normalize(config.rootPath + '/server/data/models'),
        encryptionUtilPath: path.normalize(config.rootPath + '/server/common/utilities/encryption.js'),
        controllerPath: path.normalize(config.rootPath + '/server/controllers'),
        viewsPath: path.normalize(config.rootPath + '/server/views'),
        routesPath: path.normalize(config.rootPath + '/server/routes'),
        servicesPath: path.normalize(config.rootPath + '/server/data/services'),
        authServicePath: path.join(config.rootPath, 'server', 'data', 'services', 'auth-service.js'),
        showDebugMessages: config.showDebugMessages,
        constantsPath: path.normalize(config.rootPath + '/server/common/constants.js'),

        siteTitle: 'Youtube Playlist System'
    }
};