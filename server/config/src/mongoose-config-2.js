var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    logger;

module.exports = function (app, appParams, config) {
    logger = require(appParams.loggerPath)(appParams);

    mongoose.connect(config.db);
    var db = mongoose.connection;

    db.once('open', function (err) {
        if (err)
        {
            logger.error('Database could not be opened: ' + err);
            return;
        }

        logger.log('MongoDB is up and running...');
    });

    db.on('error', function (err) {
        logger.error('MongoDB error: ' + err);
    });

    loadSchemasAndModelsSync(appParams);
};

/**
 * We need to load the models sync
 * Otherwise password requires a model and is trying to get a Model which is not registered
 */
function loadSchemasAndModelsSync(appParams) {
    var files = fs.readdirSync(appParams.modelsPath);
    files
        .filter(function (file) {
            return file.indexOf('-model') >= 0
        })
        .forEach(function (file) {
            logger.debug('Loading mongodb model ' + file);
            require(path.normalize(appParams.modelsPath + '/' + file)).init(appParams);
        });
}

