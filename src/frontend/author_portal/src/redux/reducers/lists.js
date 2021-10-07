import {
  listTypes, SET_LIST,
  SET_LIST_ERROR, SET_LIST_IS_LOADING,
  SET_LIST_TOKEN_IS_LOADING, SET_TOKEN_IS_VALIDATING,
  SET_TOKEN_VALIDITY
} from "../actions/lists";
import _ from "lodash";

const initialPaperProps = {
  elements: [],
  totNumElements: 0,
  isLoading: false
};

const paperLists = {};
paperLists[listTypes.WAITING] = {...initialPaperProps};
paperLists[listTypes.PARTIAL] = {...initialPaperProps}
paperLists[listTypes.SUBMITTED] = {...initialPaperProps};


const initialState = {
  tokenIsLoading: false,
  error: false,
  paperLists: paperLists,
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
    case SET_LIST: {
      let paperListsMod = _.cloneDeep(state.paperLists);
      paperListsMod[action.payload.listType] = {
        elements: action.payload.elements,
        totNumElements: action.payload.totNumElements,
        isLoading: false
      };
      return {
        ...state,
        paperLists: paperListsMod
      }
    }
    case SET_LIST_IS_LOADING: {
      let paperListsMod = _.cloneDeep(state.paperLists);
      paperListsMod[action.payload.listType] = {
        ...paperListsMod[action.payload.listType],
        isLoading: true
      };
      return {
        ...state,
        paperLists: paperListsMod
      }
    }
    default:
      return state;
  }
}