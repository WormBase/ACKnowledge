import {SET_LOGIN_EMAIL_SENT, SET_LOGIN_ERROR, SET_LOGIN_IS_LOADING, SET_TOKEN} from "../actions/login";

const initialState = {
  isLoading: false,
  error: false,
  token: undefined,
  emailSent: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_TOKEN: {
      return {
        ...state,
        token: action.payload.token,
        error: false,
        isLoading: false
      };
    }
    case SET_LOGIN_ERROR: {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
        emailSent: false
      };
    }
    case SET_LOGIN_IS_LOADING: {
      return {
        ...state,
        isLoading: true,
        emailSent: false,
        error: false
      }
    }
    case SET_LOGIN_EMAIL_SENT: {
      return {
        ...state,
        isLoading: false,
        emailSent: true,
        error: false
      }
    }
    default:
      return state;
  }
}