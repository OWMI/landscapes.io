// tag.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Tag schema
const tagSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },

	key: { type: String, required: true, trim: true },
	defaultValue: { type: String, trim: true },
	isGlobal: { type: Boolean, required: true },
	isRequired: { type: Boolean, required: true }
})

module.exports = mongoose.model('Tag', tagSchema)
