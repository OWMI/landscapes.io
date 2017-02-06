// author.js
import Landscape from './landscape'

const User = `
    type User {
        _id: String # the ! means that every author object _must_ have an id
        username: String!
        email: String!
        password: String!
        imageUri: String
        firstName: String
        lastName: String
        role: String!
    }
`

// we export User and all types it depends on
// in order to make sure we don't forget to include
// a dependency
export default() => [User, Landscape]
