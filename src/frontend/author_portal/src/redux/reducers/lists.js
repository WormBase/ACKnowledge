import {
  listTypes, SET_LIST,
  SET_LIST_ERROR, SET_LIST_IS_LOADING,
  SET_LIST_TOKEN_IS_LOADING, SET_TOKEN_IS_VALIDATING,
  SET_TOKEN_VALIDITY, SET_TOT_NUM_ELEMENTS
} from "../actions/lists";
import _ from "lodash";

const initialState = {
  tokenIsLoading: false,
  error: false,
  totNumWaiting: 0,
  totNumPartial: 0,
  totNumSubmitted: 0,
  tokenIsValid: undefined
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_LIST_ERROR: {
      return {
        ...state,
        error: action.payload.error,
        tokenIsLoading: false
      };
    }
    case SET_TOKEN_IS_VALIDATING: {
      return {
        ...state,
        tokenIsValidating: true,
        error: false
      }
    }
    case SET_TOKEN_VALIDITY: {
      return {
        ...state,
        tokenIsValidating: false,
        error: false,
        tokenIsValid: action.payload.validity
      }
    }
    case SET_TOT_NUM_ELEMENTS: {
      let stateMod = _.cloneDeep(state);
      switch (action.payload.listType) {
        case (listTypes.WAITING):
          stateMod.totNumWaiting = action.payload.totNumElements;
          break;
        case (listTypes.PARTIAL):
          stateMod.totNumPartial = action.payload.totNumElements;
          break;
        case (listTypes.SUBMITTED):
          stateMod.totNumSubmitted = action.payload.totNumElements;
          break;
      }
      return stateMod;
    }
    default:
      return state;
  }
}