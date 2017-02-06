// landscape.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Group schema
const groupSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },

  name: { type: String, required: true, trim: true },
  imageUri: { type: String, trim: true},
  users: { type: Array, 'default':[] },
  description: { type: String, required: true, trim: true },
  permissions: { type : Array , 'default' : [] },
  landscapes: [Schema.Types.ObjectId]
})

module.exports = mongoose.model('Group', groupSchema)
