var fs = require('fs');

module.exports = {
    /**
     * Load configuration
     * Looks up for files in ./server/config folder and loads each file with '-config' in its name
     * Additionally, custom order can be applied by giving a number after the '-config':
     *      example: 'file-config-1'
     *      this file will be first loaded
     */
    loadConfiguration: function(app, appParams, config) {
        var logger = require(appParams.loggerPath)(appParams);

        var files = fs.readdirSync(__dirname + '/src');
        files
            .filter(function (file) {
                return file.indexOf('-config') >= 0
            })
            .sort(function (file1, file2) {
                var hasCustomOrderingOption1 = file1.split('-config-'),
                    hasCustomOrderingOption2 = file2.split('-config-');

                if (!hasCustomOrderingOption1[1]) {
                    return true;
                } else if (!hasCustomOrderingOption2[1]) {
                    return false;
                } else {
                    var file1Number = hasCustomOrderingOption1[1].split('.js')[0] | 0,
                        file2Number = hasCustomOrderingOption2[1].split('.js')[0] | 0;

                    return file1Number > file2Number;
                }
            })
            .forEach(function (file) {
                logger.debug('Loading configuration ' + file);
                require('./src/' + file)(app, appParams, config);
            });
    }
};
