'use strict'

module.exports = {
    server: {
        models: 'server/auth/models/**/*.js',
        sockets: 'server/auth/sockets/**/*.js',
        config: [ 'server/auth/config/*.js' ],
        policies: 'server/auth/policies/*.js',
        routes: [ 'server/auth/routes/**/*.js' ]
    }
}
