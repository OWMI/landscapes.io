import { auth } from '../../services/auth'

/* -----------------------------------------
  constants
 ------------------------------------------*/
// protected views:
const SET_USER_ACCESS = 'SET_USER_ACCESS'

/* -----------------------------------------
  reducers
 ------------------------------------------*/
const initialState = {
    userAccess: null
}

export default (state = initialState, action) => {

    switch (action.type) {
        case SET_USER_ACCESS:
            return {
                ...state,
                userAccess: action.userAccess
            }

        default:
            return state
    }
}

/* -----------------------------------------
  action creators
 ------------------------------------------*/
export function setUserAccess(pageType, data) {

    let user = auth.getUserInfo()
    let userAccess = {
        isGlobalAdmin: false,
        isGroupAdmin: false,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canDeploy: false,
        landscapes: []
    }

    switch (pageType) {
        case 'landscapes':
            if (user.permissions && data.landscapes) {
                user.permissions.forEach(permission => {
                    data.landscapes.forEach(landscape => {
                        if (permission.landscapeId === landscape._id) {
                            landscape.allowedActions = permission.allowedActions
                            userAccess.landscapes.push(landscape)
                        }
                    })
                })
            }

            break
        default:

    }

    return {
        type: SET_USER_ACCESS,
        userAccess
    }
}
