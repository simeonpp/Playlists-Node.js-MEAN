require('./common/pollyfils');

var express = require('express'),
    env = process.env.NODE_ENV || 'development',    // used in herouku
    config = require('./server/config/config')[env],
    appParams = require('./server/config/app-params.js')(config),
    configLoader = require('./server/config/config-loader.js'),
    logger = require(appParams.loggerPath)(appParams);

var app = express();
configLoader.loadConfiguration(app, appParams, config);

app.listen(config.port);
logger.log('Server is running on port: ' + config.port + '...');
