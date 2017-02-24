'use strict'

/**
 * Module dependencies
 */
let path = require('path'),
    config = require(path.resolve('./server/config/config'))

/**
 * Get unique error field name
 */
let getUniqueErrorMessage = err => {
    let output

    try {
        let begin = 0
        if (err.errmsg.lastIndexOf('.$') !== -1) {
            begin = err.errmsg.lastIndexOf('.$') + 2
        } else {
            begin = err.errmsg.lastIndexOf('index: ') + 7
        }
        let fieldName = err.errmsg.substring(begin, err.errmsg.lastIndexOf('_1'))
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'

    } catch (ex) {
        output = 'Unique field already exists'
    }

    return output
}

/**
 * Get the error message from error object
 */
exports.getErrorMessage = err => {
    let message = ''

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err)
                break
            case 'LIMIT_FILE_SIZE':
                message = 'Image too big. Please maximum ' + (config.uploads.profileUpload.limits.fileSize / (1024 * 1024)).toFixed(2) + ' Mb files.'
                break
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Missing `newProfilePicture` field'
                break
            default:
                message = 'Something went wrong'
        }
    } else if (err.message && !err.errors) {
        message = err.message
    } else {
        for (let errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message
            }
        }
    }

    return message
}
