// mappings.js
const Mappings = `
    type Mappings {
        _id: String!
        createdBy: ID
        landscapeGroupId: String!
        landscapeGroup: String!
        mappedGroups: [String]
        type: String
    }
`

export default() => [ Mappings ]
