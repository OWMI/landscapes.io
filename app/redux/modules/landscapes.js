/* -----------------------------------------
  constants
 ------------------------------------------*/
// protected views:
const SET_ACTIVE_LANDSCAPE = 'SET_ACTIVE_LANDSCAPE'
const SET_PENDING_DEPLOYMENTS = 'SET_PENDING_DEPLOYMENTS'

/* -----------------------------------------
  reducers
 ------------------------------------------*/
const initialState = {
    activeLandscape: null,
    pendingDeployments: [],
    hasPendingDeployments: false
}

export default (state = initialState, action) => {

    switch (action.type) {
        case SET_ACTIVE_LANDSCAPE:
            return {
                ...state,
                activeLandscape: action.activeLandscape
            }
        case SET_PENDING_DEPLOYMENTS:
            return {
                ...state,
                pendingDeployments: action.pendingDeployments,
                hasPendingDeployments: action.hasPendingDeployments
            }

        default:
            return state
    }
}

/* -----------------------------------------
  action creators
 ------------------------------------------*/
export function setActiveLandscape(activeLandscape) {
    return {
        type: SET_ACTIVE_LANDSCAPE,
        activeLandscape
    }
}

export function setPendingDeployments(pendingDeployments) {

    let hasPendingDeployments = false

    if (pendingDeployments && pendingDeployments.length) {
        hasPendingDeployments = true
    }

    return {
        type: SET_PENDING_DEPLOYMENTS,
        pendingDeployments,
        hasPendingDeployments
    }
}
