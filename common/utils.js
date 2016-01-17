function ifArrayIsEmpty(arrayToCheck) {
    if (typeof arrayToCheck !== 'undefined' && arrayToCheck.length > 0) {
        // the array is defined and has at least one element
        return false;
    } else {
        return true;
    }
}

var utils = {
    ifArrayIsEmpty: ifArrayIsEmpty
};

module.exports = utils;