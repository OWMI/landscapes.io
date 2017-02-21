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
        tags: [String]
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

export default() => [Deployment, parameterObject, User]
