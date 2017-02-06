// post.js
import User from './user'
import Landscape from './landscape'

const Group = `
    type Group {
        _id: String!

        landscapes: [String]
        users: [userObject]
        permissions: [String!]
        createdAt: String
        createdBy: User
        imageUri: String

        name: String!
        description: String
    }
`
const userObject = `
    type userObject {
        userId: String!,
        isAdmin: Boolean!
    }
`


export default() => [Landscape, User, Group, userObject]

 // createdBy: { type: Schema.ObjectId, ref: 'User' },
 // img: { data: Buffer, contentType: String },
