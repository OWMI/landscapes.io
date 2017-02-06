// landscape.js
import User from './user'

const Account = `
    type Account {
        _id: String!
        name: String!
        createdAt: String
        createdBy: User
        endpoint: String
        caBundlePath: String
        rejectUnauthorizedSsl: Boolean
        signatureBlock: String
        region: String!
        isOtherRegion: Boolean
        accessKeyId: String!
        secretAccessKey: String
    }
`

export default() => [Account, User]
