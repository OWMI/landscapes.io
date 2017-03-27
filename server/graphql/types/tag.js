// Tag.js

const Tag = `
    type Tag {
        _id: String!
        key: String!
      	defaultValue: String
      	isGlobal: Boolean!
      	isRequired: Boolean!
    }
`

export default() => [Tag]
