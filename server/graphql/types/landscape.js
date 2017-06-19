// landscape.js
import User from './user'

const Landscape = `
    type Landscape {
        _id: String!
        votes: Int

        parentLandscapeId:  Landscape
        createdAt: String
        createdBy: User

        name: String!
        version: String!
        imageUri: String!

        documents: [DocumentObject]

        cloudFormationTemplate: String!
        infoLink: String
        infoLinkText: String
        description: String
    }
`
const DocumentObject = `
    type DocumentObject {
        type: String
        name: String
        url: String
    }
`

export default() => [Landscape, DocumentObject, User]

 // createdBy: { type: Schema.ObjectId, ref: 'User' },
 // img: { data: Buffer, contentType: String },
