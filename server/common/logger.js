var logger = function(appParams) {

    function log(message, notifyUser) {
        notifyUser = notifyUser | false;

        console.log(message);

        if (notifyUser) {
            // TODO: logic for notifying the user
        }
    }

    function warn(message, notifyUser) {
        notifyUser = notifyUser | false;

        console.warn(message);

        if (notifyUser) {
            // TODO: logic for notifying the user
        }
    }

    function error(message, notifyUser) {
        notifyUser = notifyUser | false;

        console.error(message);

        if (notifyUser) {
            // TODO: logic for notifying the user
        }
    }

    function debug(message) {
        if (appParams && appParams.showDebugMessages) {
            if (message[message.length-1] != '.') {
                message += '.';
            }

            console.log('~~~~~~~~    ' + message + '    ~~~~~~~~');
        }
    }

    return {
        log: log,
        warn: warn,
        error: error,
        debug: debug
    }
};

module.exports = logger;