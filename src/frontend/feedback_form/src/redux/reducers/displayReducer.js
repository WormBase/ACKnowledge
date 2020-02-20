import {
  SHOW_SECTIONS_NOT_COMPLETED,
  HIDE_SECTIONS_NOT_COMPLETED, SHOW_DATA_SAVED, HIDE_DATA_SAVED, SET_LOADING, UNSET_LOADING
} from "../actions/displayActions";


const initialState = {
  sectionsNotCompleted: false,
  dataSaved: {
    showMessage: false,
    success: false,
    lastWidget: false
  },
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SHOW_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: true,
        dataSaved: state.dataSaved,
        loading: state.loading
      };
    }
    case HIDE_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: false,
        dataSaved: state.dataSaved,
        loading: state.loading
      };
    }
    case SHOW_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: true, success: action.payload.success, lastWidget: action.payload.lastWidget},
        loading: state.loading
      };
    }
    case HIDE_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: false, success: false, lastWidget: false},
        loading: state.loading
      };
    }
    case SET_LOADING: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: true
      };
    }
    case UNSET_LOADING: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: state.dataSaved,
        loading: false
      };
    }
    default:
      return state;
  }
}
