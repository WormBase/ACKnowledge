import {
  RESET_PAPER_LIST_FILTERS,
  SET_COMBINE_FILTERS_BY,
  SET_SELECTED_PAPER_ID,
  TOGGLE_PAPER_LIST_FILTER
} from "./actions";
import _ from "lodash";

const initialState = {
  paperID: undefined,
  paperListFilters: {
    svmFilters: new Set(),
    manualFilters: new Set(),
    curationFilters: new Set(),
    combineFilters: 'AND'
  }
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SELECTED_PAPER_ID: {
      return {
        ...state,
        paperID: action.payload.paperID
      };
    }
    case RESET_PAPER_LIST_FILTERS: {
      return initialState;
    }
    case SET_COMBINE_FILTERS_BY: {
      return {
        ...state,
        paperListFilters: {
          svmFilters: state.paperListFilters.svmFilters,
          manualFilters: state.paperListFilters.manualFilters,
          curationFilters: state.paperListFilters.curationFilters,
          combineFilters: action.payload.combineFiltersBy
        }
      };
    }
    case TOGGLE_PAPER_LIST_FILTER: {
      let tempSet = new Set();
      if (action.payload.filterType === "svm") {
        tempSet = _.cloneDeep(state.paperListFilters.svmFilters);
      } else if (action.payload.filterType.filterType === "manual") {
        tempSet = _.cloneDeep(state.paperListFilters.manualFilters);
      } else if (action.payload.filterType === "curation") {
        tempSet = _.cloneDeep(state.paperListFilters.curationFilters);
      }
      if (tempSet.has(action.payload.dataType)) {
        tempSet.delete(action.payload.dataType);
      } else {
        tempSet.add(action.payload.dataType);
      }
      if (action.payload.filterType === "svm") {
        return {
          ...state,
          paperListFilters: {
            svmFilters: tempSet,
            manualFilters: state.paperListFilters.manualFilters,
            curationFilters: state.paperListFilters.curationFilters,
            combineFilters: state.paperListFilters.combineFilters
          }
        }
      } else if (action.payload.filterType === "manual") {
        return {
          ...state,
          paperListFilters: {
            svmFilters: state.paperListFilters.svmFilters,
            manualFilters: tempSet,
            curationFilters: state.paperListFilters.curationFilters,
            combineFilters: state.paperListFilters.combineFilters
          }
        }
      } else {
        return {
          ...state,
          paperListFilters: {
            svmFilters: state.paperListFilters.svmFilters,
            manualFilters: state.paperListFilters.manualFilters,
            curationFilters: tempSet,
            combineFilters: state.paperListFilters.combineFilters
          }
        }
      }
    }
    default:
      return state;
  }
}