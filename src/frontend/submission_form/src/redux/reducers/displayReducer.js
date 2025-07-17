import {
  SHOW_SECTIONS_NOT_COMPLETED,
  HIDE_SECTIONS_NOT_COMPLETED,
  SHOW_DATA_SAVED,
  HIDE_DATA_SAVED,
  SHOW_PROGRESS_SAVED,
  HIDE_PROGRESS_SAVED,
  SET_LOADING,
  UNSET_LOADING,
  SHOW_DATA_FETCH_ERROR,
  HIDE_DATA_FETCH_ERROR
} from "../actions/displayActions";


const initialState = {
  sectionsNotCompleted: false,
  dataSaved: {
    showMessage: false,
    success: false,
    lastWidget: false
  },
  progressSaved: false,
  loading: false,
  showDataFetchError: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SHOW_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: true,
        dataSaved: state.dataSaved,
        loading: state.loading,
        showDataFetchError: state.showDataFetchError
      };
    }
    case HIDE_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: false,
        dataSaved: state.dataSaved,
        loading: state.loading,
        showDataFetchError: state.showDataFetchError
      };
    }
    case SHOW_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: true, success: action.payload.success, lastWidget: action.payload.lastWidget},
        loading: state.loading,
        showDataFetchError: state.showDataFetchError
      };
    }
    case HIDE_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: false, success: false, lastWidget: false},
        loading: state.loading,
        showDataFetchError: state.showDataFetchError
      };
    }
    case SET_LOADING: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: true,
        showDataFetchError: state.showDataFetchError
      };
    }
    case UNSET_LOADING: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: false,
        showDataFetchError: state.showDataFetchError
      };
    }
    case SHOW_DATA_FETCH_ERROR: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: state.loading,
        showDataFetchError: true
      };
    }
    case HIDE_DATA_FETCH_ERROR: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: state.loading,
        showDataFetchError: false
      };
    }
    case SHOW_PROGRESS_SAVED: {
      return {
        ...state,
        progressSaved: true
      };
    }
    case HIDE_PROGRESS_SAVED: {
      return {
        ...state,
        progressSaved: false
      };
    }
    default:
      return state;
  }
}
