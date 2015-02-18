var ERRORS = module.exports = {
    URL_NOT_VALID : 'Only git respos are supported.'
}

for (var errKey in ERRORS) {
    ERRORS[errKey] = {
        msg: ERRORS[errKey],
        code: errKey
    }
}