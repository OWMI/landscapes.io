`use strict`

const { AUTH_STRATEGY, DOMAIN, GEOAXIS_CLIENT_ID, GEOAXIS_CLIENT_SECRET, GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET, LDAP_PORT_389, NODE_ENV, PROTOCOL, PUBLIC_IP, PORT, SESSION_SECRET } = process.env

let ldapUrl = LDAP_PORT_389
    ? `ldap://${LDAP_PORT_389}:389`
    : `ldap://localhost:389`

module.exports = {
    app: {
        title: `landscapes.io`,
        description: `a management tool for AWS CloudFormation`,
        keywords: `aws, cloudformation, cloud`
    },
    port: PORT || 8080,
    host: PUBLIC_IP || `0.0.0.0`,

    // DOMAIN config should be set to the fully qualified application accessible URL.
    // For example: https://www.myapp.com (including port if required).
    domain: DOMAIN,

    // Session Cookie settings
    sessionCookie: {
        // session expiration is set by default to 24 hours
        maxAge: 24 * (60 * 60 * 1000),
        // httpOnly flag makes sure the cookie is only accessed
        // through the HTTP protocol and not JS/browser
        httpOnly: true,
        secure: false
    },

    // sessionSecret should be changed for security measures and concerns
    sessionSecret: SESSION_SECRET || `blackSky`,

    // sessionKey is the cookie session name
    sessionKey: `sessionId`,
    sessionCollection: `sessions`,

    authStrategy: AUTH_STRATEGY || `ldap`,

    oauthCreds: {
        google: {
            clientID: GOOGLE_CLIENT_ID || `GOOGLE_CLIENT_ID`,
            clientSecret: GOOGLE_CLIENT_SECRET || `GOOGLE_CLIENT_SECRET`,
            callbackURL: NODE_ENV === 'production'
                         ? `${PROTOCOL}://${PUBLIC_IP}/api/auth/google/callback`
                         : `${PROTOCOL}://localhost:${PORT}/api/auth/google/callback`
        },
        geoaxis: {
            clientID: GEOAXIS_CLIENT_ID || `GEOAXIS_CLIENT_ID`,
            clientSecret: GEOAXIS_CLIENT_SECRET || `GEOAXIS_CLIENT_SECRET`,
            callbackURL: `https://landscapes.blacksky.io/api/auth/geoaxis/callback`
        }
    },

    caBundlePath: `../sslcerts/cacert.pem`,

    ldap: {
        url: ldapUrl,
        bindDn: `cn=admin,dc=landscapes,dc=io`,
        bindCredentials: `password`,
        searchBase: `ou=people,dc=landscapes,dc=io`,
        searchFilter: `(uid={{username}})`,
        groupSearchBase: `ou=groups,dc=landscapes,dc=io`,
        groupSearchFilter: `(cn={{groups}})`,
    },
    // Lusca config
    csrf: {
        csrf: false,
        csp: false,
        xframe: `SAMEORIGIN`,
        p3p: `ABCDEF`,
        xssProtection: true
    },
    uploads: {
        profileUpload: {
            dest: `./public/uploads/`, // Profile upload destination path
            limits: {
                fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
            }
        }
    },
    shared: {
        owasp: {
            allowPassphrases: true,
            maxLength: 128,
            minLength: 10,
            minPhraseLength: 20,
            minOptionalTestsToPass: 4
        }
    }
}
