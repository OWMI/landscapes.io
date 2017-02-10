// landscape.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Group schema
const typeDocumentSchema = new Schema({
  
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },

})

module.exports = mongoose.model('TypeDocument', typeDocumentSchema)
