var ERRORS = module.exports = {
    URL_NOT_VALID : 'Only git respos are supported.',
    NOT_GIT		  : 'Sorry, this script requires git'
}

for (var errKey in ERRORS) {
    ERRORS[errKey] = {
        msg: ERRORS[errKey],
        code: errKey
    }
}