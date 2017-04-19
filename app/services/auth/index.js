const TOKEN_KEY = 'token'
const USER_INFO = 'userInfo'

const APP_PERSIST_STORES_TYPES = ['localStorage', 'sessionStorage']

const parse = JSON.parse
const stringify = JSON.stringify

/*
  auth object
  -> store "TOKEN_KEY"
  - default storage is "localStorage"
  - default token key is 'token'
 */

export const auth = {
    // -------------------------
    // token
    // -------------------------
    getToken(fromStorage = APP_PERSIST_STORES_TYPES[0], tokenKey = TOKEN_KEY) {
        // localStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
            return (localStorage && localStorage.getItem(tokenKey)) || null
        }
        // sessionStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
            return (sessionStorage && sessionStorage.getItem(tokenKey)) || null
        }
        // default:
        return null
    },

    setToken(value = '', toStorage = APP_PERSIST_STORES_TYPES[0], tokenKey = TOKEN_KEY) {
        if (!value || value.length <= 0) {
            return
        }
        // localStorage:
        if (toStorage === APP_PERSIST_STORES_TYPES[0]) {
            if (localStorage) {
                localStorage.setItem(tokenKey, value)
            }
        }
        // sessionStorage:
        if (toStorage === APP_PERSIST_STORES_TYPES[1]) {
            if (sessionStorage) {
                sessionStorage.setItem(tokenKey, value)
            }
        }
    },
    /*
      Note: 'isAuthenticated' just checks 'tokenKey' on store (localStorage by default or sessionStorage)

      You may think: 'ok I just put an empty token key and I have access to protected routes?''
          -> answer is:  YES^^
       BUT
       -> : your backend will not recognize a wrong token so private data or safe and you protected view could be a bit ugly without any data.

       => ON CONCLUSION: this aim of 'isAuthenticated'
          -> is to help for a better "user experience"  (= better than displaying a view with no data since server did not accept the user).
          -> it is not a security purpose (security comes from backend, since frontend is easily hackable => user has access to all your frontend)
   */
    isAuthenticated(fromStorage = APP_PERSIST_STORES_TYPES[0], tokenKey = TOKEN_KEY) {
        // localStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
            if ((localStorage && localStorage.getItem(tokenKey))) {
                return true
            } else {
                return false
            }
        }
        // sessionStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
            if ((sessionStorage && sessionStorage.getItem(tokenKey))) {
                return true
            } else {
                return false
            }
        }
        // default:
        return false
    },

    clearToken(tokenKey = TOKEN_KEY) {
        // localStorage:
        if (localStorage && localStorage[tokenKey]) {
            localStorage.removeItem(tokenKey)
        }
        // sessionStorage:
        if (sessionStorage && sessionStorage[tokenKey]) {
            sessionStorage.removeItem(tokenKey)
        }
    },

    redirectToLogin(router) {
        if (!router.isActive({ pathname: '/login' })) {
            router.push({ pathname: '/login' })
        }
    },

    // -------------------------
    // USER_INFO
    // -------------------------
    getUserInfo(fromStorage = APP_PERSIST_STORES_TYPES[0], userInfoKey = USER_INFO) {
        // localStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
            return (localStorage && parse(localStorage.getItem(userInfoKey))) || null
        }
        // sessionStorage:
        if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
            return (sessionStorage && parse(sessionStorage.getItem(userInfoKey))) || null
        }
        // default:
        return null
    },

    setUserInfo(value = '', toStorage = APP_PERSIST_STORES_TYPES[0], userInfoKey = USER_INFO) {
        console.log(value, toStorage, userInfoKey)
        console.log(APP_PERSIST_STORES_TYPES[0])
        if (!value || value.length <= 0) {
            return
        }
        // localStorage:
        if (toStorage === APP_PERSIST_STORES_TYPES[0]) {
            if (localStorage) {
                localStorage.setItem(userInfoKey, stringify(value))
            } else {
            }
        }
        // sessionStorage:
        if (toStorage === APP_PERSIST_STORES_TYPES[1]) {
            if (sessionStorage) {
                sessionStorage.setItem(userInfoKey, stringify(value))
            }
        }
    },

    setLdapUserPermissions(user, groups, accounts, ldapGroups, mappings) {

        let userLdapGroups = []
        user.permissions = {}
        user.isGroupAdmin = false
        user.accounts = {}

        // base case
        if (user.role === 'admin') {
            user.isGlobalAdmin = true
            return user
        }

        userLdapGroups = ldapGroups.filter(lg => {
            return lg.roleOccupant.indexOf(`uid=${user.username}`) > -1
        })

        userLdapGroups.forEach(userLdapGroup => {
            mappings.forEach(mapping => {
                if (mapping.mappedGroups.indexOf(userLdapGroup.cn) > -1) {
                    const { landscapeGroup, landscapeGroupId } = mapping
                    const group = _.find(groups, { _id: landscapeGroupId })

                    user.groups.push({
                        name: group.name,
                        groupId: group._id,
                        isAdmin: false // TODO: handling group admins for ldap
                    })

                    group.landscapes.forEach(landscape => {
                        // permissions
                        user.permissions[landscape] = group.permissions

                        //accounts
                        if (!user.accounts[landscape]) {
                            user.accounts[landscape] = []
                        }

                        let _account = {}
                        if (group.accounts) {
                            group.accounts.forEach(groupAccount => {
                                accounts.forEach(account => {
                                    if (groupAccount === account._id) {
                                        _account[account._id] = account.name
                                        user.accounts[landscape].push(_account)
                                        _account = {}
                                    }
                                })
                            })
                        }
                    })
                }
            })
        })

        return user
    },

    setUserPermissions(user, groups, accounts) {

        user.permissions = {}
        user.isGroupAdmin = false
        user.accounts = {}

        // base case
        if (user.role === 'admin') {
            user.isGlobalAdmin = true
            return user
        }

        if (groups) {
            groups.forEach(group => {
                group.users.forEach(groupUser => {
                    if (groupUser.userId === user._id) {
                        // groups
                        if (groupUser.isAdmin) {
                            user.isGroupAdmin = true
                        }

                        user.groups.push({
                            name: group.name,
                            groupId: group._id,
                            isAdmin: groupUser.isAdmin
                        })

                        group.landscapes.forEach(landscape => {
                            // permissions
                            user.permissions[landscape] = group.permissions

                            //accounts
                            if (!user.accounts[landscape]) {
                                user.accounts[landscape] = []
                            }

                            let _account = {}
                            if (group.accounts) {
                                group.accounts.forEach(groupAccount => {
                                    accounts.forEach(account => {
                                        if (groupAccount === account._id) {
                                            _account[account._id] = account.name
                                            user.accounts[landscape].push(_account)
                                            _account = {}
                                        }
                                    })
                                })
                            }
                        })

                    }
                })
            })
        }
        return user
    },

    clearUserInfo(userInfoKey = USER_INFO) {
        // localStorage:
        if (localStorage && localStorage[userInfoKey]) {
            localStorage.removeItem(userInfoKey)
        }
        // sessionStorage:
        if (sessionStorage && sessionStorage[userInfoKey]) {
            sessionStorage.removeItem(userInfoKey)
        }
    },

    // ---------------------------
    // common
    // ---------------------------
    clearAllAppStorage() {
        if (localStorage) {
            console.log('stuff')
            localStorage.clear()
        }
        if (sessionStorage) {
            console.log('session')
            sessionStorage.clear()
        }
    }
}
