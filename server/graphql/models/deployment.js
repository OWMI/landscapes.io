// deployment.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// deployment schema
const deploymentSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    stackName: { type: String, required: true },
    accountName: { type: String, required: true },
    landscapeId: { type: Schema.ObjectId, ref: 'Landscape', index: true },
    isDeleted: { type : Boolean, 'default' : false },

    description: String,
    location: String,
    billingCode: String,
    flavor: String,

    cloudFormationTemplate: String,
    cloudFormationParameters: { type : Array , 'default' : [] },

    tags: { type : Array , 'default' : [] },
    notes: { type : Array , 'default' : [] },

    stackId: String,
    stackStatus: String,
    stackLastUpdate: Date,
    awsErrors: String
})

module.exports = mongoose.model('Deployment', deploymentSchema)
