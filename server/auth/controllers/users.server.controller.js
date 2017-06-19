'use strict'

/**
 * Module dependencies
 */
import { extend } from 'lodash'

/**
 * Extend user's controller
 */
module.exports = extend(
    require('./users/users.authentication.server.controller'),
    require('./users/users.authorization.server.controller'),
    require('./users/users.password.server.controller'),
    require('./users/users.profile.server.controller')
)
