// ldapGroup.js

const ldapGroup = `
    type ldapGroup {
        dn: String
        controls: [String]
        cn: String
        objectClass: [String]
        roleOccupant: String
    }
`

export default() => [ldapGroup]
