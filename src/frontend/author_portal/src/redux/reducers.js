import {SET_ERROR, SET_IS_LOADING, SET_TOKEN} from "./actions";

const initialState = {
    isLoading: false,
    error: false,
    token: undefined
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_TOKEN: {
      return {
        ...state,
        token: action.payload.token,
        error: false,
        isLoading: false,
        success: true
      };
    }
    case SET_ERROR: {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
        success: false
      };
    }
    case SET_IS_LOADING: {
      return {
        ...state,
        isLoading: true,
        success: false,
        error: false
      }
    }
    default:
      return state;
  }
}