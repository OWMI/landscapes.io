'use strict'

let admin = require('../controllers/admin.server.controller')

module.exports = app => {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app)

  // Finish by binding the user middleware
  app.param('userId', admin.userByID)
}
