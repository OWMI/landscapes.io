// deployment.js
import User from './user'

const Deployment = `
    type Deployment {
        _id: String!
        createdAt: String
        createdBy: String
        stackName: String
        accountName: String
        landscapeId: String
        isDeleted: Boolean
        description: String
        location: String
        billingCode: String
        flavor: String
        accessKeyId: String
        secretAccessKey: String
        cloudFormationTemplate: String
        cloudFormationParameters: [parameterObject]
        tags: [tagObject]
        notes: [String]
        stackId: String
        stackStatus: String
        stackLastUpdate: String
        awsErrors: String
    }
`

const parameterObject = `
    type parameterObject {
        ParameterKey: String
        ParameterValue: String
    }
`
const tagObject = `
    type tagObject {
        Key: String
        Value: String
    }
`

export default() => [Deployment, parameterObject, tagObject,  User]
