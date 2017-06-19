import moment from 'moment'
const dateFormat = 'DD/MM/YYYY HH:mm'

/* -----------------------------------------
  constants
 ------------------------------------------*/
// non protected views:
const ENTER_HOME_VIEW = 'ENTER_HOME_VIEW'
const LEAVE_HOME_VIEW = 'LEAVE_HOME_VIEW'

// protected views:
const ENTER_PROTECTED_VIEW = 'ENTER_PROTECTED_VIEW'
const LEAVE_PROTECTED_VIEW = 'LEAVE_PROTECTED_VIEW'
const ENTER_LANDSCAPES_VIEW = 'ENTER_LANDSCAPES_VIEW'
const LEAVE_LANDSCAPES_VIEW = 'LEAVE_LANDSCAPES_VIEW'
const ENTER_USERS_VIEW = 'ENTER_USERS_VIEW'
const LEAVE_USERS_VIEW = 'LEAVE_USERS_VIEW'
const ENTER_GROUPS_VIEW = 'ENTER_GROUPS_VIEW'
const LEAVE_GROUPS_VIEW = 'LEAVE_GROUPS_VIEW'
const ENTER_GROUP_DETAILS_VIEW = 'ENTER_GROUP_DETAILS_VIEW'
const LEAVE_GROUP_DETAILS_VIEW = 'LEAVE_GROUP_DETAILS_VIEW'
const ENTER_LOGIN_VIEW = 'ENTER_LOGIN_VIEW'
const LEAVE_LOGIN_VIEW = 'LEAVE_LOGIN_VIEW'
const ENTER_REGISTER_VIEW = 'ENTER_REGISTER_VIEW'
const LEAVE_REGISTER_VIEW = 'LEAVE_REGISTER_VIEW'
const ENTER_PASSWORD_CHANGE_VIEW = 'ENTER_PASSWORD_CHANGE_VIEW'
const LEAVE_PASSWORD_CHANGE_VIEW = 'LEAVE_PASSWORD_CHANGE_VIEW'

const initialState = {
    currentView: 'not set',
    enterTime: null,
    leaveTime: null
}

/* -----------------------------------------
reducers
------------------------------------------*/
export default (state = initialState, action) => {
    const currentTime = moment().format(dateFormat)

    switch (action.type) {
        // /////////////////////
        // non protected views:
        // /////////////////////
        case ENTER_HOME_VIEW:
        case ENTER_LANDSCAPES_VIEW:
        case ENTER_USERS_VIEW:
        case ENTER_GROUPS_VIEW:
        case ENTER_LOGIN_VIEW:
        case ENTER_REGISTER_VIEW:
            // can't enter if you are already inside
            if (state.currentView !== action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    enterTime: currentTime
                }
            }
            return state

        case LEAVE_HOME_VIEW:
        case LEAVE_LANDSCAPES_VIEW:
        case LEAVE_USERS_VIEW:
        case LEAVE_GROUPS_VIEW:
        case LEAVE_LOGIN_VIEW:
        case LEAVE_REGISTER_VIEW:
            // can't leave if you aren't already inside
            if (state.currentView === action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    leaveTime: currentTime
                }
            }
            return state

        // /////////////////////
        // ENTER_PASSWORD_CHANGE_VIEW views:
        // /////////////////////
        case ENTER_PASSWORD_CHANGE_VIEW:
            if (state.currentView !== action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    enterTime: currentTime
                }
            }
            return state

        case LEAVE_PASSWORD_CHANGE_VIEW:
            if (state.currentView === action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    leaveTime: currentTime
                }
            }
            return state
        // /////////////////////
        // protected views:
        // /////////////////////
        case ENTER_PROTECTED_VIEW:
            if (state.currentView !== action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    enterTime: currentTime
                }
            }
            return state

        case LEAVE_PROTECTED_VIEW:
            if (state.currentView === action.currentView) {
                return {
                    ...state,
                    currentView: action.currentView,
                    leaveTime: currentTime
                }
            }
            return state

        default:
            return state
    }
}

/* -----------------------------------------
  action creators
 ------------------------------------------*/
export function enterHome() {
    return {
        type: ENTER_HOME_VIEW, currentView: 'home'
    }
}

export function leaveHome() {
    return {
        type: LEAVE_HOME_VIEW, currentView: 'home'
    }
}

export function enterLandscapes() {
    return {
        type: ENTER_LANDSCAPES_VIEW, currentView: 'landscapes'
    }
}

export function leaveLandscapes() {
    return {
        type: LEAVE_LANDSCAPES_VIEW, currentView: 'landscapes'
    }
}
export function enterUsers() {
    return {
        type: ENTER_USERS_VIEW, currentView: 'users'
    }
}
export function leaveUsers() {
    return {
        type: LEAVE_USERS_VIEW, currentView: 'users'
    }
}
export function enterGroups() {
    return {
        type: ENTER_GROUPS_VIEW, currentView: 'groups'
    }
}

export function leaveGroups() {
    return {
        type: LEAVE_GROUPS_VIEW, currentView: 'groups'
    }
}
export function enterGroupDetails() {
    return {
        type: ENTER_GROUP_DETAILS_VIEW, currentView: 'group-details'
    }
}

export function leaveGroupDetails() {
    return {
        type: LEAVE_GROUP_DETAILS_VIEW, currentView: 'group-details'
    }
}

export function enterLogin() {
    return {
        type: ENTER_LOGIN_VIEW, currentView: 'login'
    }
}

export function leaveLogin() {
    return {
        type: LEAVE_LOGIN_VIEW, currentView: 'login'
    }
}

export function enterRegister() {
    return {
        type: ENTER_REGISTER_VIEW, currentView: 'register'
    }
}

export function leaveRegister() {
    return {
        type: LEAVE_REGISTER_VIEW, currentView: 'register'
    }
}

export function enterPasswordChange() {
    return {
        type: ENTER_PASSWORD_CHANGE_VIEW, currentView: 'password'
    }
}

export function leavePasswordChange() {
    return {
        type: LEAVE_PASSWORD_CHANGE_VIEW, currentView: 'password'
    }
}
export function enterProtected() {
    return {
        type: ENTER_PROTECTED_VIEW, currentView: 'protected'
    }
}

export function leaveProtected() {
    return {
        type: LEAVE_PROTECTED_VIEW, currentView: 'protected'
    }
}
