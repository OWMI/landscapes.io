import { forIn } from 'lodash'
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
        isGroupAdmin: false,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExecute: false,
        landscapes: []
    }

    forIn(user.permissions, value => {
        if (value.indexOf('c') > -1) {
            userAccess.canCreate = true
        }
    })

    switch (pageType) {
        case 'landscapes':
            if (user.permissions && data.landscapes) {
                for (let landscapeId in user.permissions) {
                    data.landscapes.forEach(landscape => {
                        if (landscapeId === landscape._id) {
                            userAccess.landscapes.push(landscape)
                        }
                    })
                }
            }

            break
        default:

    }

    return {
        type: SET_USER_ACCESS,
        userAccess
    }
}
