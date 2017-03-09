// author.js

const Integration = `
    type Integration {
        _id: String! # the ! means that every author object _must_ have an id
        username: String
        password: String
        name: String
        type: String
        imageUri: String
    }
`

// we export User and all types it depends on
// in order to make sure we don't forget to include
// a dependency
export default() => [Integration]
