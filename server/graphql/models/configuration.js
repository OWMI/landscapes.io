// configuration.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// configuration schema
const configurationSchema = new Schema({
    isFirstUser: { type : Boolean, default : false }
})

module.exports = mongoose.model('Configuration', configurationSchema)
