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

        cloudFormationTemplate: String!
        infoLink: String
        infoLinkText: String
        description: String
    }
`

export default() => [Landscape, User]

 // createdBy: { type: Schema.ObjectId, ref: 'User' },
 // img: { data: Buffer, contentType: String },
