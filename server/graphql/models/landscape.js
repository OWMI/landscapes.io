// landscape.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// landscape schema
const landscapeSchema = new Schema({
    parentLandscapeId: { type: Schema.ObjectId, ref: 'Landscape' },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    version: { type: String, required: true },
    imageUri: { type: String },
    img: { data: Buffer, contentType: String },
    cloudFormationTemplate: { type: String, required: true },
    infoLink: String,
    infoLinkText: String,
    description: String
})

module.exports = mongoose.model('Landscape', landscapeSchema)
