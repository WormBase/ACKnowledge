import {
  listTypes,
  SET_LIST_ERROR,
  SET_LIST_IS_LOADING,
  SET_NUM_PAPERS_IN_LIST,
  SET_TOKEN_VALIDITY
} from "../actions/lists";
import _ from "lodash";

const listCounters = {};
listCounters[listTypes.WAITING] = "loading...";
listCounters[listTypes.PARTIAL] = "loading...";
listCounters[listTypes.SUBMITTED] = "loading...";

const initialState = {
  isLoading: false,
  error: false,
  listCounters: listCounters,
  tokenIsValid: undefined
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_LIST_ERROR: {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };
    }
    case SET_LIST_IS_LOADING: {
      return {
        ...state,
        isLoading: true,
        error: false
      }
    }
    case SET_TOKEN_VALIDITY: {
      return {
        ...state,
        isLoading: false,
        error: false,
        tokenIsValid: action.payload.validity
      }
    }
    case SET_NUM_PAPERS_IN_LIST: {
      let listCountersMod = _.cloneDeep(state.listCounters);
      listCountersMod[action.payload.list] = action.payload.num;
      return {
        ...state,
        listCounters: listCountersMod
      }
    }
    default:
      return state;
  }
}