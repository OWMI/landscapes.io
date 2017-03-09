// mappings.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// mappings schema
const mappingsSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.ObjectId, ref: 'User' },
    landscapeGroupId: { type: String, required: true },
    landscapeGroup: { type: String, required: true },
    mappedGroups: { type: Array, 'default': [] },
    type: { type: String, 'default': 'ldap' }
})

module.exports = mongoose.model('Mappings', mappingsSchema)
