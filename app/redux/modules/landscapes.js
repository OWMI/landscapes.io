/* -----------------------------------------
  constants
 ------------------------------------------*/
// protected views:
const SET_ACTIVE_LANDSCAPE = 'SET_ACTIVE_LANDSCAPE'

/* -----------------------------------------
  reducers
 ------------------------------------------*/
const initialState = {
    activeLandscape: null
}

export default (state = initialState, action) => {

    switch (action.type) {
        case SET_ACTIVE_LANDSCAPE:
            return {
                ...state,
                activeLandscape: action.activeLandscape
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
